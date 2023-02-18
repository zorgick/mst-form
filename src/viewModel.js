import { types, cast, flow } from "mobx-state-tree";

export const FormValue = types.model("FormValue", {
    id: types.identifier,
    name: types.string,
    value: types.string
});

export const FormField = types
    .model("FormField", {
        id: types.identifier,
        label: types.optional(types.string, ""),
        disabled: types.optional(types.boolean, false),
        required: types.optional(types.boolean, false),
        // set the attribute below to true if an id of an option
        // is not unique across the whole MST tree
        needsPrefix: types.optional(types.boolean, false),
        // if field is initialized and not mutated by a user
        // it is pristine
        pristine: types.optional(types.boolean, true),
        error: types.maybe(types.string),
        fieldIndex: types.maybe(types.string),
        values: types.optional(types.array(FormValue), []),
        singleValue: types.optional(types.string, ""),
        selected: types.maybe(types.reference(types.late(() => FormValue))),
        // never use 2 attributes bellow simultaneously per field
        // if the field has a dependant field assign it on a initialisation
        next: types.maybe(types.reference(types.late(() => FormField))),
        // if the field has a list of dependant fields (tree nodes) assign it on initialisation
        children: types.array(types.safeReference(types.late(() => FormField)))
    })
    .volatile((self) => ({
        updateFunc: undefined,
        requestParams: {}
    }))
    .actions((self) => ({
        setSelection(selected, { isInternalSet } = {}) {
            if (self.error) {
                self.error = "";
            }

            // selection of multiple values is possible
            // only when array of values has items
            // OR this condition is met when setSelection
            // is called from the inside of the model
            if (self.values.length > 0 || isInternalSet) {
                // refernce must be reseted before
                // values are updated
                // OR select supports an empty selection
                if (!selected) {
                    self.selected = undefined;
                } else {
                    if (!self.pristine) {
                        self.needsPrefix = false;
                    }

                    // for non unique values' ids add prefix of a field id
                    // if the set id is a default or was previously set (chosen not from values)
                    self.selected = self.needsPrefix
                        ? `${self.id}_${selected}`
                        : selected;
                }
                // Do not walk through the linked list or tree nodes if
                // this field receives a default value from the server
                // and user has no possibility to modify it yet
                if (self.pristine) {
                    self.pristine = false;
                    return;
                }

                if (self.next && self.children.length) {
                    throw new Error(
                        "A field cannot have multiple child nodes and a single child node simultaneously."
                    );
                }
                // doesn't matter if a selected variable received a reference or not
                // require an update for a child
                if (self.next) {
                    self.next.updateValues({ id: selected });
                }
                if (self.children.length) {
                    self.children.forEach((child) =>
                        child.updateValues({ id: selected })
                    );
                }
            } else {
                self.singleValue = selected;
            }
        },
        updateRequestParams(params) {
            self.requestParams = params;
        }
    }))
    .actions((self) => ({
        setUpdateFunc(updateFunc) {
            if (typeof updateFunc !== "function") {
                throw new Error(
                    "It looks like you provided something else instead of function"
                );
            }
            self.updateFunc = updateFunc;
        },
        updateValues: flow(function* (params) {
            if (!self.disabled) {
                self.disabled = true;
            }
            // set selected value only when field is mutated by a user
            if (!self.pristine) {
                self.setSelection(undefined, { isInternalSet: true });
            }
            try {
                // request values on initialisation
                // or repeat requests when parent field
                // changes its selection
                if (self.pristine || (params && params.id)) {
                    const newValues = yield self.updateFunc({
                        ...params,
                        ...(self.needsPrefix && { prefix: self.id }),
                        ...self.requestParams
                    });
                    self.values = cast(newValues);
                    self.disabled = false;
                }
            } catch (error) {
                self.error = error;
                throw new Error("Values assignment failed");
            }
        })
    }));

const RootStore = types
    .model({
        formValues: types.map(FormField),
        newValues: types.optional(types.array(types.string), [])
    })
    .views((self) => ({
        get fieldIds() {
            const fieldIds = [];
            self.formValues.forEach(({ id, fieldIndex }) => {
                if (id) {
                    if (fieldIndex) {
                        fieldIds.splice(fieldIndex, 0, id);
                    } else {
                        fieldIds.push(id);
                    }
                }
            });

            return fieldIds;
        },
        get hasFields() {
            const fieldIds = [];
            self.formValues.forEach(({ id }) => {
                if (id) {
                    fieldIds.push(id);
                }
            });

            return fieldIds.length > 0;
        }
    }))
    .actions((self) => ({
        getAnotherData: flow(function* ({ id }) {
            yield new Promise((resolve) => {
                setTimeout(resolve, 1000);
            }).then((result) => {});
            const values = [
                {
                    id: "idite",
                    value: "idite",
                    name: "Я вас не звал! Идите дальше!"
                },
                {
                    id: "hi",
                    value: "hi",
                    name: "Дратути!"
                },
                {
                    id: "netochno",
                    value: "netochno",
                    name: "Но это не точно"
                }
            ];
            return values;
        }),
        getData: flow(function* ({ id }) {
            yield new Promise((resolve) => {
                setTimeout(resolve, 1000);
            }).then((result) => {});
            const values = [
                {
                    id: "tamada",
                    value: "tamada",
                    name: "Хороший тамада! И конкурсы интересные"
                },
                {
                    id: "opyat",
                    value: "opyat",
                    name: "Никогда такого не было! И вот опять!"
                },
                {
                    id: "musk",
                    value: "musk",
                    name: "Как тебе такое Илон Маск?!"
                }
            ];
            return values;
        })
    }))
    .actions((self) => ({
        afterCreate() {
            self.formValues.set("Category1", {
                id: "Category1",
                label: "Мемы 1й категории",
                disabled: false,
                required: true,
                fieldIndex: "1",
                values: [
                    { name: "Збс", value: "zaebis", id: "zaebis" },
                    { name: "Чотко", value: "chetko", id: "chetko" },
                    {
                        name: "Пацаны вообще ребята",
                        value: "pazani",
                        id: "pazani"
                    }
                ]
            });
            self.formValues.set("Category2", {
                id: "Category2",
                label: "Мемы 2й категории",
                disabled: false,
                required: true,
                fieldIndex: "2",
                values: [
                    { name: "Мутный тип", value: "tip", id: "tip" },
                    { name: "Пойдем отсюда", value: "go", id: "go" },
                    {
                        name: "Долбит нормально!",
                        value: "dolbit",
                        id: "dolbit"
                    }
                ]
            });
            self.formValues.set("Category3", {
                id: "Category3",
                label: "Мемы 3й категории",
                disabled: false,
                required: true,
                fieldIndex: "3",
                values: [
                    {
                        name: "Повар спрашивает повара",
                        value: "povar",
                        id: "povar"
                    },
                    {
                        name: "Водочки нам принеси",
                        value: "vodochki",
                        id: "vodochki"
                    },
                    {
                        name: "В щи прописать?",
                        value: "ebich",
                        id: "ebich"
                    }
                ]
            });
            self.formValues.get("Category2").setUpdateFunc(self.getData);
            self.formValues.get("Category3").setUpdateFunc(self.getAnotherData);

            // This is a raw example of setting a selection.
            // In a real world the field will be initialized, then values fetched from
            // the server and then selection will be made.
            // There are however two scenarios of how first selection will be made
            // 1) by a code itself on initialisation -> then it works as is
            // 2) by a user -> then on field initialisation you
            // need to set self.pristine to false
            // Both described scenarios are for dependant fields

            // Below is the 1-st scenario

            self.formValues.get("Category1").setSelection("pazani");
            self.formValues.get("Category2").setSelection("dolbit");
            self.formValues.get("Category3").setSelection("ebich");

            // 1st case: Each field depends on the previos one at a time
            self.formValues.get("Category1").next = "Category2";
            self.formValues.get("Category2").next = "Category3";

            // 2d case: Both fields depend on the first field simultaneously
            // self.formValues
            //    .get("Category1")
            //    .children.push("Category2", "Category3");
            self.formValues.set("description", {
                id: "description",
                label: "Описание",
                fieldIndex: "0",
                singleValue:
                    "Почему тут так мало?! ТЫ на пенек сел, сотку должен!"
            });
        },
        changeField(id, selected) {
            self.formValues.get(id).setSelection(selected);
        }
    }));

export const store = RootStore.create({});
