$BYOBU_PREFIX/share/byobu/keybindings/f-keys.tmux.disable
unbind-key -n C-s
unbind-key -n C-a
set -g prefix ^A
set -g prefix2 F12
bind a send-prefix
