import React from "react";
import { render } from "react-dom";
import { observer } from "mobx-react";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import { store } from "./viewModel";

export const DetailsSelect = observer(
    ({ field, changeField, inputProps, selectProps }) => {
        const handleDetailsChange = (event) => {
            const { name, value } = event.target;
            changeField(name, value);
        };
        const label = `${field.label} ${field.required ? " *" : ""}`;
        let FieldComponent;
        if (field.values.length > 0) {
            FieldComponent = (
                <React.Fragment>
                    <InputLabel id={field.id}>{label}</InputLabel>
                    <Select
                        id={field.id}
                        label={label}
                        labelId={field.id}
                        name={field.id}
                        disabled={field.disabled}
                        value={
                            field.selected && field.selected.value
                                ? field.selected.value
                                : ""
                        }
                        onChange={handleDetailsChange}
                        {...selectProps}
                    >
                        {field.values.map(({ name, value }) => (
                            <MenuItem key={value} value={value}>
                                {name}
                            </MenuItem>
                        ))}
                    </Select>
                </React.Fragment>
            );
        } else {
            FieldComponent = (
                <TextField
                    id={field.id}
                    label={label}
                    value={field.singleValue}
                    name={field.id}
                    variant="outlined"
                    disabled={field.disabled}
                    onChange={handleDetailsChange}
                    {...inputProps}
                />
            );
        }

        return (
            <FormControl
                fullWidth
                variant="outlined"
                disabled={field.disabled}
                error={!!field.error}
                style={{ marginTop: 16, marginBottom: 16 }}
            >
                {FieldComponent}
                {field.error && <FormHelperText>{field.error}</FormHelperText>}
            </FormControl>
        );
    }
);

// The UI (View) can be wrapped into storebooster component
// Then all data will be injected into component and not
// passed in props
// https://github.com/zorgick/mst-storebooster
const AppView = observer((props) => {
    return (
        <div>
            <div>
                {props.store.hasFields &&
                    props.store.fieldIds.map((id) => {
                        return (
                            <DetailsSelect
                                changeField={props.store.changeField}
                                field={props.store.formValues.get(id)}
                                key={id}
                                {...(id === "description" && {
                                    inputProps: {
                                        multiline: true,
                                        rows: 4,
                                        rowsMax: 18
                                    }
                                })}
                            />
                        );
                    })}
            </div>
        </div>
    );
});

render(<AppView store={store} />, document.getElementById("root"));
