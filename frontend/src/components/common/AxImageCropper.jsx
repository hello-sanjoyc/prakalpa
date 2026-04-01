import React, { useMemo, useState } from "react";
import Cropper from "react-easy-crop";

const labelClass = "text-[11px] uppercase tracking-[0.25em] auth-accent";
const inputClass =
    "w-full rounded-xl border auth-border/60 bg-slate-900/40 px-3 py-2 text-sm auth-text-primary focus:border-amber-200/60 focus:outline-none";

const DEFAULT_ASPECTS = [
    { label: "1:1", value: 1 },
    { label: "2:1", value: 2 / 1 },
    { label: "4:3", value: 4 / 3 },
    { label: "16:9", value: 16 / 9 },
];

const ALLOWED_TYPES = ["image/jpeg", "image/png"];

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", reject);
        image.setAttribute("crossOrigin", "anonymous");
        image.src = url;
    });

const getCroppedImage = async (
    imageSrc,
    pixelCrop,
    { outputType, quality, minSize, maxSize }
) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const { width, height, x, y } = pixelCrop;
    let scale = 1;
    if (width < minSize || height < minSize) {
        scale = Math.max(minSize / width, minSize / height);
    }
    if (width * scale > maxSize || height * scale > maxSize) {
        scale = Math.min(maxSize / width, maxSize / height);
    }
    const targetWidth = Math.round(width * scale);
    const targetHeight = Math.round(height * scale);
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, x, y, width, height, 0, 0, targetWidth, targetHeight);
    const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
            (result) => {
                if (!result) {
                    reject(new Error("Unable to crop image"));
                    return;
                }
                resolve(result);
            },
            outputType,
            quality
        );
    });
    return { blob, width: targetWidth, height: targetHeight };
};

const buildFileName = (name, outputType) => {
    const base = (name || "image").replace(/\.[^.]+$/, "");
    const extension = outputType === "image/png" ? "png" : "jpg";
    return `${base}-cropped.${extension}`;
};

export default function AxImageCropper({
    imageSrc,
    fileName,
    fileType,
    onCancel,
    onComplete,
    onError,
    aspectOptions = DEFAULT_ASPECTS,
    minSize = 250,
    maxSize = 512,
    maxFileSize = 50 * 1024,
}) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [aspectLabel, setAspectLabel] = useState(
        aspectOptions[0]?.label || "1:1"
    );
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [saving, setSaving] = useState(false);

    const aspectMap = useMemo(() => {
        const map = new Map();
        aspectOptions.forEach((option) => map.set(option.label, option.value));
        return map;
    }, [aspectOptions]);

    const aspect = aspectMap.get(aspectLabel) || 1;

    const handleCropComplete = (_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    };

    const handleSave = async () => {
        if (!croppedAreaPixels) {
            onError?.("Select a crop area before saving.");
            return;
        }
        setSaving(true);
        try {
            let outputType = ALLOWED_TYPES.includes(fileType)
                ? fileType
                : "image/jpeg";
            let quality =
                outputType === "image/jpeg" || outputType === "image/jpg"
                    ? 0.9
                    : undefined;
            let result = await getCroppedImage(imageSrc, croppedAreaPixels, {
                outputType,
                quality,
                minSize,
                maxSize,
            });
            if (
                result.width < minSize ||
                result.height < minSize ||
                result.width > maxSize ||
                result.height > maxSize
            ) {
                throw new Error(
                    `Crop must be between ${minSize}x${minSize} and ${maxSize}x${maxSize}px`
                );
            }
            if (result.blob.size > maxFileSize) {
                const qualitySteps = [0.85, 0.75, 0.65, 0.55, 0.45];
                outputType = "image/jpeg";
                let compressed = null;
                for (const step of qualitySteps) {
                    const attempt = await getCroppedImage(
                        imageSrc,
                        croppedAreaPixels,
                        {
                            outputType,
                            quality: step,
                            minSize,
                            maxSize,
                        }
                    );
                    if (attempt.blob.size <= maxFileSize) {
                        compressed = attempt;
                        quality = step;
                        break;
                    }
                }
                if (!compressed) {
                    throw new Error(
                        `Cropped image must be ${Math.round(
                            maxFileSize / 1024
                        )}KB or smaller`
                    );
                }
                result = compressed;
            }
            const file = new File(
                [result.blob],
                buildFileName(fileName, outputType),
                {
                    type: outputType,
                }
            );
            onComplete?.(file, {
                width: result.width,
                height: result.height,
                type: outputType,
            });
        } catch (err) {
            onError?.(err.message || "Failed to crop image.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed left-1/2 top-1/2 z-50 flex h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl bg-slate-950 p-4">
            <div className="w-full max-w-4xl rounded-3xl border auth-border auth-surface p-6 auth-shadow">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className={labelClass}>Crop image</p>
                        <p className="mt-1 text-xs auth-text-secondary">
                            Drag the frame, pick an aspect ratio, and zoom to
                            refine the crop.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary"
                    >
                        Close
                    </button>
                </div>

                <div className="relative mt-4 h-72 w-full overflow-hidden rounded-2xl border auth-border bg-slate-950">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        cropShape="rect"
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={handleCropComplete}
                    />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div>
                        <p className={labelClass}>Aspect</p>
                        <select
                            value={aspectLabel}
                            onChange={(e) => setAspectLabel(e.target.value)}
                            className={inputClass}
                        >
                            {aspectOptions.map((option) => (
                                <option key={option.label} value={option.label}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <p className={labelClass}>Zoom</p>
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full"
                        />
                        <p className="mt-1 text-xs auth-text-secondary">
                            {zoom.toFixed(1)}x
                        </p>
                    </div>
                    <div>
                        <p className={labelClass}>Output</p>
                        <p className="text-xs auth-text-secondary">
                            {minSize}-{maxSize}px ·{" "}
                            {Math.round(maxFileSize / 1024)}KB max
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-full border auth-border px-4 py-2 text-xs font-semibold auth-text-primary"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 px-5 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-pink-500/30 disabled:opacity-70"
                    >
                        {saving ? "Cropping..." : "Use cropped image"}
                    </button>
                </div>
            </div>
        </div>
    );
}
