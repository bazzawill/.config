# bulletlist

![Animation](animation.svg)

```go
package main

import "github.com/pterm/pterm"

func main() {
	// Print a list with different levels.
	// Useful to generate lists automatically from data.
	pterm.DefaultBulletList.WithItems([]pterm.BulletListItem{
		{Level: 0, Text: "Level 0"},
		{Level: 1, Text: "Level 1"},
		{Level: 2, Text: "Level 2"},
	}).Render()

	// Convert a text to a list and print it.
	pterm.NewBulletListFromString(`0
 1
  2
   3`, " ").Render()
}

```
