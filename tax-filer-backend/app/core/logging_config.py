# tax-filer-backend/app/core/logging_config.py
import logging
import logging.handlers
from pathlib import Path

# Define the log directory relative to the backend app's root
LOG_DIR = Path(__file__).resolve().parent.parent.parent / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)  # Create logs directory if it doesn't exist

LOG_FILE = LOG_DIR / "tax_app_backend.log"


# Custom formatter
class CustomFormatter(logging.Formatter):
    grey = "\x1b[38;20m"
    blue = "\x1b[34;20m"
    yellow = "\x1b[33;20m"
    red = "\x1b[31;20m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"

    FORMATS_FILE = {
        logging.DEBUG: "[%(asctime)s] [%(levelname)s] [%(name)s:%(lineno)d] %(message)s",
        logging.INFO: "[%(asctime)s] [INFO] [%(name)s] %(message)s",
        logging.WARNING: "[%(asctime)s] [WARNING] [%(name)s:%(lineno)d] %(message)s",
        logging.ERROR: "[%(asctime)s] [ERROR] [%(name)s:%(lineno)d] %(message)s (%(exc_info)s)",
        logging.CRITICAL: "[%(asctime)s] [CRITICAL] [%(name)s:%(lineno)d] %(message)s (%(exc_info)s)",
    }

    def __init__(
        self, fmt="%(levelno)d: %(msg)s", datefmt="%Y-%m-%d %H:%M:%S", use_colors=False
    ):
        self.use_colors = use_colors  # Not used for file logging here
        super().__init__(datefmt=datefmt)

    def format(self, record):
        log_fmt = self.FORMATS_FILE.get(record.levelno)
        formatter = logging.Formatter(log_fmt, datefmt=self.datefmt)
        return formatter.format(record)


def setup_app_logger(name="tax_app_backend_logger", log_level=logging.INFO):
    logger = logging.getLogger(name)
    logger.setLevel(log_level)
    logger.propagate = False

    if not logger.handlers:  # Rotates daily, keeps 7 backup logs
        trfh = logging.handlers.TimedRotatingFileHandler(
            LOG_FILE,
            when="midnight",  # Rotate at midnight
            interval=1,  # Daily
            backupCount=7,  # Keep 7 days of logs
            encoding="utf-8",
        )
        trfh.setFormatter(CustomFormatter(use_colors=False))
        logger.addHandler(trfh)

    return logger


# Instantiate a default logger for easy import
app_logger = setup_app_logger()
