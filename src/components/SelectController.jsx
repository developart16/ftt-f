import React, { useState } from "react";
import { Select } from 'antd';

const {Option} = Select;

export default function SelectController({
    selected = [],
    optionsList = [],
    onChange = ()=>{},
    selectOptions = {},
}) {

    const [currentSelected, setCurrentSelected] = useState(selected);

    return (
        <Select
            {...selectOptions}
            value={currentSelected}
            onChange={ _value => setCurrentSelected(_value)}
            onBlur={ () => onChange(currentSelected) }
        >
            {optionsList.map( _crypto => <Option key={_crypto.id} value={_crypto.id}> {_crypto.name} </Option>)}
        </Select>
    )
}