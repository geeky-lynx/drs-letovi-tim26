import re as regex



def is_email_valid(email: str) -> bool:
    if '@' not in email:
        return False
    [user, domain] = email.split('@')
    if len(user) < 1 or '.' not in domain:
        return False

    for char in user.lower():
        if char not in "abcdefghijklmnopqrstuvxqz1234567890.":
            return False
    for char in domain.lower():
        if char not in "abcdefghijklmnopqrstuvxqz1234567890.":
            return False

    [host, compart] = domain.split('.', 1)
    if len(host) < 1 or len(compart) < 2:
        return False
    return True



def is_password_valid(password: str) -> bool:
    length = len(password)
    if 8 > length or length > 25:
        return False
    if regex.search(r"[a-zA-Z0-9.,?!@#$%^&*_\;-]+", password) is None:
        return False
    return True
