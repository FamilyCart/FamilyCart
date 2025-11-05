from django.contrib import admin
from family.models import Family, Role, FamilyMembership

# ------------------------------------------------------------------------------
# Admin Configuration
# ------------------------------------------------------------------------------
# This admin class customizes how the Family model appears in Django Admin.
# It adds filters, search functionality, ordering, pagination, and grouping of fields.
# ------------------------------------------------------------------------------

class FamilyAdmin(admin.ModelAdmin):
    list_display = ("id","name", "family_code", "created_at", "updated_at")
    list_filter = ("created_at",)
    search_fields = ("name", "family_code")
    readonly_fields = ("uuid", "created_at", "updated_at")
    ordering = ("-created_at",)
    list_per_page = 20

    fieldsets = (
        ("Basic Information", {
            "fields": ("uuid", "name", "family_code", "description")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
admin.site.register(Family, FamilyAdmin)



class RoleAdmin(admin.ModelAdmin):
    list_display = ("id","name", "created_at", "updated_at")
    search_fields = ("name",)
    readonly_fields = ("uuid", "created_at", "updated_at")
    ordering = ("-created_at",)
    list_per_page = 20

    fieldsets = (
        ("Role Details", {
            "fields": ("uuid", "name", "description")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
admin.site.register(Role, RoleAdmin)


class FamilyMembershipAdmin(admin.ModelAdmin):
    list_display = ("id","user", "family", "role", "created_at", "updated_at")
    list_filter = ("role", "family")
    search_fields = ("user__username", "family__name", "role__name")
    readonly_fields = ("uuid", "created_at", "updated_at")
    ordering = ("-created_at",)
    list_select_related = ("user", "family", "role")
    list_per_page = 25

    fieldsets = (
        ("Membership Info", {
            "fields": ("uuid", "user", "family", "role")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
admin.site.register(FamilyMembership, FamilyMembershipAdmin)


