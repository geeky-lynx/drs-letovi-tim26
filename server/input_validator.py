import re as regex
import bcrypt



ALLOWED_EMAIL_CHARS = "abcdefghijklmnopqrstuvxqz1234567890."
PASSWORD_PATTERN = r"[a-zA-Z0-9.,?!@#$%^&*_\;-]+"



def is_email_valid(email: str) -> bool:
    if '@' not in email:
        return False
    [user, domain] = email.split('@')
    if len(user) < 1 or '.' not in domain:
        return False

    for char in user.lower():
        if char not in ALLOWED_EMAIL_CHARS:
            return False
    for char in domain.lower():
        if char not in ALLOWED_EMAIL_CHARS:
            return False

    [host, compart] = domain.split('.', 1)
    if len(host) < 1 or len(compart) < 2:
        return False
    return True



def is_password_valid(password: str) -> bool:
    length = len(password)
    if 8 > length or length > 25:
        return False
    if regex.search(PASSWORD_PATTERN, password) is None:
        return False
    return True



def is_password_matching(plain_unhashed_password: str, stored_password: bytes) -> bool:
    plain: bytes = plain_unhashed_password.encode("utf-8")
    hashed = stored_password
    print(f"hashed password in db = {hashed}") # Debuggability
    # For some retarded reason it's stored as '\x1234af...'; "0x..." added just in case
    if hashed[0] in ['\\', '0'] and hashed[1] == 'x':
        hashed = hashed[2:]

    is_password_correct = False
    try:
        is_password_correct = bcrypt.checkpw(
            plain,
            bytes.fromhex(hashed)
        )

    except ValueError as error:
        print("ValueError EXCEPTION: hashes not matched")
        print("Stacktrace:")
        print(error)

    return is_password_correct
