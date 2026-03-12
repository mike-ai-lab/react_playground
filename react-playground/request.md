Upgrade my React playground runtime to support **real dependency loading instead of mocks**.

Current behavior:

* Imports are stripped
* External libraries are replaced with mock components
* This increases render success but breaks real library behavior

I want a **dynamic CDN dependency loader**.

Requirements:

1. Parse all `import` statements from user code.
2. For any external package (not react/react-dom), resolve it using:
   https://esm.sh/

Example:

```
import { motion } from "framer-motion"
```

Should dynamically load:

```
https://esm.sh/framer-motion
```

3. Inject dynamic module loading inside the iframe before executing user code.

Example loader:

```
const moduleCache = {}

async function loadModule(name) {
  if (moduleCache[name]) return moduleCache[name]

  const mod = await import(`https://esm.sh/${name}`)
  moduleCache[name] = mod
  return mod
}
```

4. Replace imported identifiers with values from loaded modules.

Example:

```
import { motion } from "framer-motion"
```

becomes internally:

```
const { motion } = await loadModule("framer-motion")
```

5. Support these import styles:

* default imports
* named imports
* alias imports
* mixed imports

Examples:

```
import React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button as Btn } from "@/components/ui/button"
```

6. Keep fallback mocks only when module loading fails.

7. Maintain the existing features:

* Babel TSX compilation
* iframe sandbox execution
* error overlay
* execution history
* Tailwind support

8. Ensure execution runs inside an **async wrapper** so `await import()` works.

Example wrapper:

```
(async function() {
   // dynamic imports
   // compiled component
})()
```

Goal:

Transform the playground into a **real React runtime sandbox** capable of executing most AI-generated React components that use npm libraries without bundling.

Return the **full upgraded code** with minimal explanation.
