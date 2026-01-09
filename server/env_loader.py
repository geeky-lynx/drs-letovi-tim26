from mailbox import FormatError
import os
import sys
from typing_extensions import Dict



def load_local_env() -> Dict[str, str]:
    env: Dict[str, str] = {}
    
    # Get full path
    abspath = os.path.abspath(sys.argv[0])
    dir: str = os.path.dirname(abspath)
    filename = f"{dir}/.env"
    
    if not os.path.exists(filename):
        raise FileNotFoundError(f"There is no file named \'{filename}\'")
    
    # Start reading
    with open(filename) as file:
        if not file.readable():
            raise OSError("No read permissions")
        
        lines = file.readlines()
        
        for (num, line) in enumerate(lines):
            if line.strip()[0] == '#':
                pass # Commented out
            
            if '=' not in line:
                raise FormatError(f"Line {num}: Incorrectly formatted line (expected: <key>=<value>; got: {line}")
                
            # No problemos
            [key, value] = line.split('=')
            env[key.strip()] = value.strip()
    
    return env