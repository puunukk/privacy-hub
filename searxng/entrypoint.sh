#!/bin/bash
# SearXNG environment variable processing entrypoint

# Debug: Check if settings file exists
echo "=== SearXNG Entrypoint Debug ==="
echo "Settings file exists: $(ls -la /etc/searxng/settings.yml 2>/dev/null || echo 'NOT FOUND')"

# Clean up any !ENV tags that might exist
sed -i 's/!ENV \[.*,\s*\(.*\)\]/\1/g' /etc/searxng/settings.yml 2>/dev/null || true

# Replace environment variables in settings.yml if they exist
if [ -n "$SEARXNG_SECRET_KEY" ]; then
    echo "Setting secret key..."
    sed -i "s/CHANGE_ME_TO_RANDOM_50_CHARS/$SEARXNG_SECRET_KEY/g" /etc/searxng/settings.yml
fi

if [ -n "$SEARXNG_DEFAULT_THEME" ]; then
    echo "Setting theme to: $SEARXNG_DEFAULT_THEME"
    sed -i "s/default_theme: simple/default_theme: $SEARXNG_DEFAULT_THEME/g" /etc/searxng/settings.yml
fi

if [ -n "$SEARXNG_SAFE_SEARCH" ]; then
    echo "Setting safe search to: $SEARXNG_SAFE_SEARCH"
    sed -i "s/safe_search: 1/safe_search: $SEARXNG_SAFE_SEARCH/g" /etc/searxng/settings.yml
fi

if [ -n "$SEARXNG_DEFAULT_LANG" ]; then
    echo "Setting language to: $SEARXNG_DEFAULT_LANG"
    sed -i "s/default_lang: \"en\"/default_lang: \"$SEARXNG_DEFAULT_LANG\"/g" /etc/searxng/settings.yml
fi

echo "Final settings file content:"
cat /etc/searxng/settings.yml

# Start SearXNG using the original command
exec searxng-run