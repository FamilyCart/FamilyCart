from django.contrib import admin
from grocery.models import *

# ------------------------------------------------------------------------------
# Admin Configuration for Model
# ------------------------------------------------------------------------------
# This admin class customizes how the model appears in Django Admin.
# It adds filters, search functionality, ordering, pagination, and grouping of fields.
# ------------------------------------------------------------------------------

class GroceryItemInline(admin.TabularInline):
    """Inline display of grocery items inside a grocery list."""
    model = GroceryItem
    extra = 1
    fields = ("id","name", "quantity", "quantity_type", "purchased", "created_by", "created_at")
    readonly_fields = ("created_at",)
    show_change_link = True


class GroceryListAdmin(admin.ModelAdmin):
    """Admin configuration for Grocery Lists."""
    list_display = ("id","name", "family_name", "created_by", "created_at", "updated_at")
    search_fields = ("name", "family_membership__family__name", "family_membership__user__username")
    list_filter = ("created_at", "updated_at")
    readonly_fields = ("created_at", "updated_at")
    inlines = [GroceryItemInline]

    def family_name(self, obj):
        return obj.family_membership.family.name
    family_name.short_description = "Family"

    def created_by(self, obj):
        return obj.family_membership.user.username
    created_by.short_description = "Created By"

admin.site.register(GroceryList, GroceryListAdmin)

class GroceryItemAdmin(admin.ModelAdmin):
    """Admin configuration for Grocery Items."""
    list_display = ("id","name", "grocery_list_name", "quantity", "quantity_type", "purchased", "created_by", "created_at")
    search_fields = ("name", "grocery_list__name", "created_by__username")
    list_filter = ("quantity_type", "purchased", "created_at")
    readonly_fields = ("created_at", "updated_at")

    def grocery_list_name(self, obj):
        return obj.grocery_list.name
    grocery_list_name.short_description = "Grocery List"


admin.site.register(GroceryItem, GroceryItemAdmin)
