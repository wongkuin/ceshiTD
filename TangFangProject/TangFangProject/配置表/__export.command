cd "$(dirname "$0")"
python3 __export.py
osascript -e 'tell application "Terminal" to quit' &
exit