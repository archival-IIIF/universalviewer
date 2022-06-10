#!/bin/sh

mv /usr/share/nginx/html/default.html /usr/share/nginx/html/index.html

case "$UV_PROFILE" in
   "iish") mv /usr/share/nginx/html/iish.css /usr/share/nginx/html/default.css ;;
esac

exec "/docker-entrypoint.sh" "$@"
