// Copyright (c) 2025, kowsalya and contributors
// For license information, please see license.txt

frappe.ui.form.on("Project Work Order", {
    refresh(frm) {
        // for client details 
        if (frm.doc.client_name) {
            console.log(frm.doc.client_name)
            frappe.call({
                method: "workorder_kowsalya.workorder_kowsalya.doctype.project_work_order.project_work_order.fetch_address",
                args: {
                    client_name: frm.doc.client_name,
                },
                callback: function (r) {
                    let [address, contact, email] = r.message;

                    if (address) {
                        frm.set_df_property("client_address", "read_only", 1);
                    } else {
                        frm.set_df_property("client_address", "read_only", 0);
                    }
                    if (email) {
                        frm.set_df_property("client_email", "read_only", 1);
                    } else {
                        frm.set_df_property("client_email", "read_only", 0);
                    }
                    if (contact) {
                        frm.set_df_property("client_phone", "read_only", 1);
                    } else {
                        frm.set_df_property("client_phone", "read_only", 0);
                    }

                },
            });
        } else {
            frm.set_value("client_email", "");
            frm.set_value("client_address", "");
            frm.set_value("client_phone", "");
        }
        

        if (frm.doc.workflow_state === "Submitted") {
            frm.add_custom_button("Change status", () => {


                let d = new frappe.ui.Dialog({
                    title: "Status Update",
                    fields: [
                        {
                            label: __("Status"),
                            fieldname: "status",
                            fieldtype: "Select",
                            options: ["Completed", "Cancelled"],
                        },
                    ],
                    primary_action_label: "Update",
                    primary_action(values) {
                        frappe.call({
                            method: "workorder_kowsalya.workorder_kowsalya.doctype.project_work_order.project_work_order.status",
                            args: { value: values.status , name:frm.doc.name},
                            callback: function (r) {
                                if(r){
                                
                                    frm.reload_doc()

                                }
                            }
                        })
                        
                        d.hide();

                    },
                });
                d.show();
            });
        }



        setTimeout(() => {
            // Hide all buttons or links that say "Edit"
            $("a.dropdown-item:contains('Edit'), button.dropdown-item:contains('Edit')").hide();
        }, 500);
        if(frm.is_new()){
                frm.set_query("linked_quotation", () => {
                return {
                    filters: {
                        customer_name: frm.doc.client_name,
                        docstatus:1,
                    },
                }
            })
            }
    },
    onload(frm) {
        
        
        if (frm.doc.client_name && frm.is_new() ) {

            frappe.call({
                method: "workorder_kowsalya.workorder_kowsalya.doctype.project_work_order.project_work_order.fetch_address",
                args: { client_name: frm.doc.client_name },
                callback: function (r) {
                    let [address, contact, email] = r.message;
                    if (address) {
                        frm.set_value("client_address", address);
                        frm.set_df_property("client_address", "read_only", 1);
                    } else {
                        frm.set_value("client_address", " ");
                        frm.set_df_property("client_address", "read_only", 0);
                    }
                    if (email) {
                        frm.set_value("client_email", email);
                        frm.set_df_property("client_email", "read_only", 1);
                    } else {
                        frm.set_value("client_email", " ");
                        frm.set_df_property("client_email", "read_only", 0);
                    }
                    if (contact) {
                        frm.set_value("client_phone", contact);
                        frm.set_df_property("client_phone", "read_only", 1);
                    } else {
                        frm.set_value("client_phone", "");
                        frm.set_df_property("client_phone", "read_only", 0);
                    }
                    
                    

                },
                

            });

            
            
            
        }
    },
    client_name(frm) {
        if (frm.doc.client_name) {

            frappe.call({
                method: "workorder_kowsalya.workorder_kowsalya.doctype.project_work_order.project_work_order.fetch_address",
                args: { client_name: frm.doc.client_name },
                callback: function (r) {
                    let [address, contact, email] = r.message;
                    if (address) {
                        frm.set_value("client_address", address);
                        frm.set_df_property("client_address", "read_only", 1);
                    } else {
                        frm.set_value("client_address", " ");
                        frm.set_df_property("client_address", "read_only", 0);
                    }
                    if (email) {
                        frm.set_value("client_email", email);
                        frm.set_df_property("client_email", "read_only", 1);
                    } else {
                        frm.set_value("client_email", " ");
                        frm.set_df_property("client_email", "read_only", 0);
                    }
                    if (contact) {
                        frm.set_value("client_phone", contact);
                        frm.set_df_property("client_phone", "read_only", 1);
                    } else {
                        frm.set_value("client_phone", "");
                        frm.set_df_property("client_phone", "read_only", 0);
                    }

                },
            });
            frm.set_query("linked_quotation", () => {
                return {
                    filters: {
                        customer_name: frm.doc.client_name,
                        docstatus:1,
                    },
                }
            })
        }
        else {
            frm.set_value("client_address", "")
            frm.set_value("client_email", "")
            frm.set_value("client_phone", "")
        }


    },
    before_workflow_action: async function (frm) {
        const action = frm.selected_workflow_action;

        if (action && action.toLowerCase() === "submit") {
            frappe.dom.unfreeze();
            frappe.validated = false;

            return new Promise((resolve, reject) => {
                const d = new frappe.ui.Dialog({
                    title: "WorkOrder Confirmation",
                    fields: [
                        {
                            label: __("Work Order Title"),
                            fieldname: "work_order_title",
                            fieldtype: "Data",
                            default: frm.doc.work_order_title,
                            read_only: 1,
                        },
                        {
                            label: __("Work Type"),
                            fieldname: "work_type",
                            fieldtype: "Data",
                            default: frm.doc.work_type,
                            read_only: 1,
                        },
                        {
                            label: __("Total Quantity"),
                            fieldname: "total_quantity",
                            fieldtype: "Data",
                            default: frm.doc.total_quantity,
                            read_only: 1,
                        },
                        {
                            label: __("Total Amount"),
                            fieldname: "total_amount",
                            fieldtype: "Data",
                            default: frm.doc.total_amount,
                            read_only: 1,
                        },
                    ],
                    primary_action_label: "Confirm",
                    primary_action: () => {
                        if (frm.doc.total_amount == 0) {
                            d.hide();
                            frm.set_value("workflow_state", "Draft");
                            frm.save();
                            frappe.throw("There was no quantity in item");
                        }

                        const has_missing_description = frm.doc.work_items_table?.some(r => !r.description);
                        if (has_missing_description) {
                            d.hide();
                            frm.set_value("workflow_state", "Draft");
                            frm.save();
                            frappe.throw("Add Description in the item");
                        }

                        frm.set_value("workflow_state", "Submitted");
                        d.hide();
                        resolve();
                    },
                    secondary_action_label: "Back",
                    secondary_action: () => {
                        d.hide();
                        frm.set_value("workflow_state", "Draft");
                        frm.set_value("status", "Draft");
                        frm.save();
                        reject("Action cancelled by user.");
                    }
                });

                d.$wrapper.on("hide.bs.modal", () => {
                    if (!frm.doc.workflow_state || frm.doc.workflow_state !== "Submitted") {
                        frm.set_value("workflow_state", "Draft");
                        frm.set_value("status", "Draft");
                        frm.save();
                        reject("Dialog closed by user.");
                    }
                });

                d.show();
            });
        }
    },

    start_date(frm) {
        duration(frm);
    },
    end_date(frm) {
        duration(frm);
    },

    linked_quotation(frm) {
        frm.clear_table("work_items_table");
        frm.set_value("work_items_table", []);
        frm.refresh_fields("work_items_table");

        if (frm.doc.linked_quotation && frm.doc.client_name) {

            frappe.call({
                method: "workorder_kowsalya.workorder_kowsalya.doctype.project_work_order.project_work_order.fetch_item_value",
                args: {
                    cust_name: frm.doc.client_name,
                    quotation: frm.doc.linked_quotation
                },
                callback: function (r) {
                    let value = r.message.items;
                    let total_qty = 0;
                    let total_amt = 0;
                    value.forEach((row) => {
                        let item_child = frm.add_child("work_items_table");
                        item_child.item_code = row.item_code;
                        item_child.unit = row.uom;
                        item_child.quantity = row.qty;
                        item_child.rate = row.rate;
                        item_child.amount = row.rate * row.qty;
                        total_qty += row.qty;
                        total_amt += row.rate * row.qty;
                        frm.refresh_fields("work_items_table");
                        frm.set_value("total_quantity");
                    });
                    frm.set_value("total_quantity", total_qty);
                    frm.set_value("total_amount", total_amt);
                },
            });
        } else {
            frm.clear_table("work_items_table");
            frm.set_value("work_items_table", []);
            frm.refresh_fields("work_items_table");
            frm.set_value("total_quantity", 0);
            frm.set_value("total_amount", 0);
            frm.set_value("linked_quotation", "");
            frm.refresh_fields("linked_quotation");

        }
    },

});
frappe.ui.form.on("Work Order Task", {
    work_items_table_add: function (frm, cdn, cdt) {
        calc(frm, cdn, cdt)
        total(frm, cdt, cdn)
        if (frm.doc.client_name && frm.doc.linked_quotation) {
            frappe.call({
                method: "workorder_kowsalya.workorder_kowsalya.doctype.project_work_order.project_work_order.check_item_value",
                args: {
                    cust_name: frm.doc.client_name,
                    quotation: frm.doc.linked_quotation
                },
                callback: function (r) {
                    if (r) {
                        let item_codes = r.message.items.map((row) => row.item_code);
                        console.log(item_codes);
                        frm.set_query("item_code", "work_items_table", () => {
                            return {
                                filters: {
                                    item_name: ["in", item_codes],
                                },
                            };
                        });
                    }
                },
            });
        } else {
            frm.set_value("work_items_table", []);
            frm.refresh_fields("work_items_table");
            frm.set_df_property("linked_quotation", "reqd", 1);
            frappe.throw("Enter the Linked Quotation and Customer");


        }
    },
    work_items_table_remove: function (frm, cdn, cdt) {
        calc(frm, cdn, cdt)
        total(frm, cdt, cdn)
    },
    quantity: function (frm, cdn, cdt) {
        calc(frm, cdn, cdt)
        total(frm, cdt, cdn)
    },
    rate: function (frm, cdn, cdt) {
        calc(frm, cdn, cdt)
        total(frm, cdt, cdn)
    }

});
function calc(frm, cdn, cdt) {
    frm.doc.work_items_table.forEach((r) => {
        let value = 0
        if (r.quantity && r.rate) {
            value = r.quantity * r.rate
            frappe.model.set_value(cdn, cdt, "amount", value)
        }
        else {
            frappe.model.set_value(cdn, cdt, "amount", 0)
        }
    });
}
function total(frm, cdt, cdn) {
    let total_qty = 0
    let total_amt = 0
    frm.doc.work_items_table.forEach((r) => {
        if (r.quantity) {
            total_qty += r.quantity | 0
        }
        if (r.amount) {
            total_amt += r.amount | 0
        }
    })
    frm.set_value("total_quantity", total_qty)
    frm.set_value("total_amount", total_amt)
}
//for date differnce
function duration(frm) {
    if (frm.doc.start_date && frm.doc.end_date) {
        frappe.call({
            method: "workorder_kowsalya.workorder_kowsalya.doctype.project_work_order.project_work_order.day_difference",
            args: {
                start_date: frm.doc.start_date,
                end_date: frm.doc.end_date,
            },
            callback: function (r) {
                if (r.message == -1) {
                    frappe.msgprint("Please fill the proper start date and end date")
                    frm.set_value("start_date", "")
                    frm.set_value("end_date", "")
                }
                else {
                    frm.set_value("duration", r.message)
                }
            },
        });
    }
    else {
        frm.set_value("duration", "")
    }
}






