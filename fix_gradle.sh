#!/bin/bash
echo "=== Fixing all gradle files ==="

# 1. Fix ALL jcenter() references across all packages
find node_modules -name "*.gradle" | while read f; do
  if grep -q "jcenter()" "$f"; then
    echo "Fixing jcenter in $f"
    perl -i -pe 's/jcenter\(\)/mavenCentral()\n        google()/g' "$f"
  fi
done

# 2. Fix react-native-fast-image old gradle plugin 2.3.3
perl -i -pe 's/com\.android\.tools\.build:gradle:2\.3\.3/com.android.tools.build:gradle:3.5.3/g' \
  node_modules/react-native-fast-image/android/build.gradle

# 3. Fix WheelPicker missing dependency
perl -i -ne 'print unless /cn\.aigestudio\.wheelpicker/' \
  node_modules/react-native-wheel-picker/android/build.gradle

# 4. Add repositories block to react-native-video exoplayer files
for f in \
  "node_modules/react-native-video/android-exoplayer/build.gradle" \
  "node_modules/react-native-gifted-chat/node_modules/react-native-video/android-exoplayer/build.gradle"; do
  if [ -f "$f" ] && ! grep -q "^repositories" "$f"; then
    echo "Adding repositories block to $f"
    python3 -c "
content = open('$f').read()
repos = '''
repositories {
    google()
    mavenCentral()
    jcenter()
}
'''
content = content.replace('def safeExtGet', repos + 'def safeExtGet')
open('$f', 'w').write(content)
print('Fixed $f')
"
  fi
done

echo "=== All fixes applied ==="
