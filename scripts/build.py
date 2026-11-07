"""Build the standalone offline file using only Python's standard library."""
from pathlib import Path
import re, hashlib, json
root=Path(__file__).resolve().parents[1]
web=root/'web'; out=root/'dist'; out.mkdir(exist_ok=True)
html=(web/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>\n'+(web/'styles.css').read_text()+'\n</style>')
scripts=[]
for name in ['engine.js','missions.js','app.js']:
    html=html.replace('<script defer src="'+name+'"></script>','')
    scripts.append('<script>\n'+(web/name).read_text().replace('</script','<\\/script')+'\n</script>')
html=re.sub(r'<link rel="(?:manifest|icon)"[^>]+>','',html)
html=html.replace('</body>', '\n'.join(scripts)+'\n</body>')
# Single-file build: there is no sw.js beside this file, so the app must not
# attempt a service-worker registration on load (it 404s in the console).
# Mirror the file: branch of offline() instead of calling it.
old_start="switchMission(progress.mission);if(startupMessage)notice(startupMessage);offline();"
new_start="switchMission(progress.mission);if(startupMessage)notice(startupMessage);$('offline-status').textContent='This downloaded copy runs offline. Keep this file on your device.';$('cache-offline').hidden=true;"
assert old_start in html, 'build: expected offline() startup call not found in inlined app.js'
html=html.replace(old_start,new_start)
path=out/'OpenLine-Robot-Academy.html';path.write_text(html)
print(json.dumps({'file':str(path),'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}))
