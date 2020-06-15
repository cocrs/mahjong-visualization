import json
import os

if __name__ == "__main__":
    pathList = os.listdir('interface/gameRecordOutput')
    fileList = ['gameRecordOutput/' + i for i in pathList if os.path.isfile('interface/gameRecordOutput/' + i)]
    with open('gameflowFileList.json', 'w', encoding='utf-8') as f:
        json.dump(fileList, f, indent=4, ensure_ascii=False)
        f.close()
