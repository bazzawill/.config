Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward
Set-PSReadLineKeyHandler -Key UpArrow -Function HistorySearchBackward
Set-PSReadLineOption -Colors @{ InLinePrediction = '#00cc00'
                                Command            = 'Magenta'
                                Number             = 'White'
                                Member             = 'Yellow'
                                Operator           = 'Yellow'
                                Type               = 'Green'
                                Variable           = 'Green'
                                Parameter          = 'Yellow'
                                ContinuationPrompt = 'White'
                                Default            = 'White'
                              }
Set-PSReadLineKeyHandler -Key Tab -Function MenuComplete
