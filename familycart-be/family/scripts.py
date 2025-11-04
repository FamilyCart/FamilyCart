from family.models import FamilyMembership
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned

def fetch_my_family_membership(user):
    """
    Fetch the FamilyMembership instance associated with the given user.

    Args:
        user (User): The user instance for whom the membership is fetched.

    Returns:
        FamilyMembership instance if found, otherwise None.
    """

    if not user:
        print("fetch_my_family_membership called with no user.")
        return None

    try:
        # Try to get single membership record
        membership = FamilyMembership.objects.get(user=user)
        return membership.id

    except ObjectDoesNotExist:
        print(f"No FamilyMembership found for user ID: {user.id}")
        return None

    except MultipleObjectsReturned:
        # Handle case where multiple memberships exist (shouldn’t happen normally)
        print(f"Multiple FamilyMembership records found for user ID: {user.id}. Returning the first created one.")
        return FamilyMembership.objects.filter(user=user).last().id

    except Exception as e:
        # Catch any other unexpected issue
        print(f"Error fetching FamilyMembership for user ID {getattr(user, 'id', None)}: {e}")
        return None
