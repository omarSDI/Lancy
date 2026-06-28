"""
Lansy.ai — Rate Limiter (shared module)
Centralized slowapi limiter to avoid circular imports.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

# Global limiter instance — imported by main.py and routers
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])
