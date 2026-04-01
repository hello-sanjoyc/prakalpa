import React, { useState, useEffect } from "react";
import { apiRequest } from "../lib/apiClient";

const AxDropdown = (props) => {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        apiRequest(props.url, "GET", null, {})
            .then((response) => {
                if (response.status === 200) {
                    setOptions(
                        response.data.response.map((res) => ({
                            value: res.itemKey,
                            label: res.itemValue,
                        }))
                    );
                } else {
                    setOptions([]);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    return (
        <>
            <select
                className="form-select"
                name={props.name}
                id={props.id}
                value={props.value}
                onChange={props.onChange}
            >
                <option value="">{props.placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </>
    );
};

export default AxDropdown;
