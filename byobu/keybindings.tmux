unbind-key -n C-s
unbind-key -n C-a
set -g prefix ^A
set -g prefix2 F12
bind a send-prefix
bind -n C-j select-pane -D
bind -n C-h select-pane -L
bind -n C-k select-pane -U
bind -n C-l select-pane -R
unbind-key -
bind - split-window -h
unbind-key F2
