import os
from pathlib import Path

import requests

ENV_FILE = Path(__file__).resolve().parents[2] / ".env"
FLOW_URL_ENV = "API_POWERAUTOMATE_WBS"


def load_dotenv_value(name: str) -> str | None:
    if not ENV_FILE.exists():
        return None
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        if key.strip() == name:
            return value.strip().strip("'\"")
    return None


def get_flow_url() -> str:
    flow_url = os.getenv(FLOW_URL_ENV) or load_dotenv_value(FLOW_URL_ENV)
    if not flow_url:
        raise RuntimeError(f"Missing {FLOW_URL_ENV}. Add it to .env or your shell environment.")
    return flow_url


def fetch_raw_tasks() -> list[dict]:
    response = requests.post(get_flow_url(), json={}, timeout=120)
    response.raise_for_status()
    return response.json()["msg"]["rawTasks"]


def main() -> None:
    import pandas as pd

    try:
        data = pd.DataFrame(fetch_raw_tasks())
        print(data)
    except requests.exceptions.JSONDecodeError:
        print("Response is not JSON.")
    except requests.exceptions.Timeout:
        print("Automation did not respond before timeout.")
    except requests.exceptions.RequestException as e:
        print("Request error:", e)


if __name__ == "__main__":
    main()
