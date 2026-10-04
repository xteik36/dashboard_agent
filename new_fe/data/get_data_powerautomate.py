import requests
import json
import pandas as pd
FLOW_URL = "https://e529bbe72a95e1cb92f8c3389a8132.91.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/16/workflows/53e09ee466334b31abdf6e634458661c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=7IFC2dynm4EaVcm_Y8iWhjQ5AB5LUYHWzLjUz1HdkqE"
try:
    response = requests.post(
        FLOW_URL,
        json={},
        timeout=120
    )
    data = response.json()['msg']
    data = pd.DataFrame(data['rawTasks'])
    print(data)

    
except requests.exceptions.JSONDecodeError:
    print("Response không phải JSON:")
    print(response.text)

except requests.exceptions.Timeout:
    print("Automation không phản hồi trong thời gian timeout.")

except requests.exceptions.RequestException as e:
    print("Lỗi request:", e)