#!/bin/bash
# SearXNG environment variable processing entrypoint

# Replace environment variables in settings.yml if they exist
if [ -n "$SEARXNG_SECRET_KEY" ]; then
    sed -i "s/CHANGE_ME_TO_RANDOM_50_CHARS/$SEARXNG_SECRET_KEY/g" /etc/searxng/settings.yml
fi

if [ -n "$SEARXNG_DEFAULT_THEME" ]; then
    sed -i "s/default_theme: simple/default_theme: $SEARXNG_DEFAULT_THEME/g" /etc/searxng/settings.yml
fi

if [ -n "$SEARXNG_SAFE_SEARCH" ]; then
    sed -i "s/safe_search: 1/safe_search: $SEARXNG_SAFE_SEARCH/g" /etc/searxng/settings.yml
fi

if [ -n "$SEARXNG_DEFAULT_LANG" ]; then
    sed -i "s/default_lang: \"en\"/default_lang: \"$SEARXNG_DEFAULT_LANG\"/g" /etc/searxng/settings.yml
fi

# Start SearXNG using the original command
exec searxng-run