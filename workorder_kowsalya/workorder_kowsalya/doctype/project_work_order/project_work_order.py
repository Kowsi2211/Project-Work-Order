# Copyright (c) 2025, kowsalya and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import  days_diff


class ProjectWorkOrder(Document):
	
	pass
@frappe.whitelist()
def fetch_address(client_name):
	
	link = frappe.db.get_value("Dynamic Link",{"link_name":client_name,"link_doctype":"Customer"},"parent")

	
	if link:
		address = frappe.get_doc("Address",link)
		value = f"{address.address_line1}\n {address.city}\n{address.country}"
		contact = address.phone or 0
		email = address.email_id or 0
	else:
		value = 0
		contact = 0
		email = 0
	
		
	return value,contact,email

@frappe.whitelist()
def day_difference(start_date,end_date):
	if start_date > end_date:
		value = -1
	else:
		value = days_diff(end_date,start_date)
	return value

#for items table
@frappe.whitelist()
def fetch_item_value(cust_name,quotation):
	item = frappe.db.get_value("Quotation",{"customer_name":cust_name,"name":quotation})
	item_details = frappe.get_doc("Quotation",item)
	return item_details

@frappe.whitelist()
def check_item_value(cust_name,quotation):
	item = frappe.db.get_value("Quotation",{"customer_name":cust_name,"name":quotation})
	item_details = frappe.get_doc("Quotation",item)
	return item_details