
interface FeatureAPI {
  title: string
  description: string
  pattern: string
}

const getPromptFromFeatures = (feats: FeatureAPI[]) =>
  feats.map(({ title, description, pattern }) => `## "${title}": ${description}.\nExample: \`${pattern}\``).join("\n")


export const attributes: FeatureAPI[] = [
  {
    title: "x-data",
    description: "Declare a new Alpine component and its data for a block of HTML",
    pattern:
`<div x-data="{ open: false }">
...
</div>`
  },
  {
    title: "x-bind",
    description: "Dynamically set HTML attributes on an element",
    pattern:
`<div x-bind:class="! open ? 'hidden' : ''">
...
</div>`
  },
  {
    title: "x-on",
    description: "Listen for browser events on an element",
    pattern:
`<button x-on:click="open = ! open">
Toggle
</button>`
  },
  {
    title: "x-text",
    description: "Set the text content of an element",
    pattern:
`<div>
Copyright ©

<span x-text="new Date().getFullYear()"></span>
</div>`
  },
  {
    title: "x-html",
    description: "Set the inner HTML of an element",
    pattern:
`<div x-html="(await axios.get('/some/html/partial')).data">
...
</div>`
  },
  {
    title: "x-model",
    description: "Synchronize a piece of data with an input element",
    pattern:
`<div x-data="{ search: '' }">
<input type="text" x-model="search">

Searching for: <span x-text="search"></span>
</div>`
  },
  {
    title: "x-show",
    description: "Toggle the visibility of an element",
    pattern:
`<div x-show="open">
...
</div>`
  },
  {
    title: "x-transition",
    description: "Transition an element in and out using CSS transitions",
    pattern:
`<div x-show="open" x-transition>
...
</div>`
  },
  {
    title: "x-for",
    description: "Repeat a block of HTML based on a data set",
    pattern:
`<template x-for="post in posts">
<h2 x-text="post.title"></h2>
</template>`
  },
  {
    title: "x-if",
    description: "Conditionally add/remove a block of HTML from the page entirely",
    pattern:
`<template x-if="open">
<div>...</div>
</template>`
  },
  {
    title: "x-init",
    description: "Run code when an element is initialized by Alpine",
    pattern:
`<div x-init="date = new Date()"></div>`
  },
  {
    title: "x-effect",
    description: "Execute a script each time one of its dependencies change",
    pattern:
`<div x-effect="console.log('Count is '+count)"></div>`
  },
  {
    title: "x-ref",
    description: "Reference elements directly by their specified keys using the $refs magic property",
    pattern:
`<input type="text" x-ref="content">
 
<button x-on:click="navigator.clipboard.writeText($refs.content.value)">
  Copy
</button>`
  },
  {
    title: "x-cloak",
    description: "Hide a block of HTML until after Alpine is finished initializing its contents",
    pattern:
`<div x-cloak>
...
</div>`
  },
  {
    title: "x-ignore",
    description: "Prevent a block of HTML from being initialized by Alpine",
    pattern:
`<div x-ignore>
...
</div>`
  },
]

export const attributesPrompt = getPromptFromFeatures(attributes)

export const properties: FeatureAPI[] = [
  {
    title: "$store",
    description: "Access a global store registered using Alpine.store(...)",
    pattern: `<h1 x-text="$store.site.title"></h1>`
  },
  {
    title: "$el",
    description: "Reference the current DOM element",
    pattern:`<div x-init="new Pikaday($el)"></div>`
  },
  {
    title: "$dispatch",
    description: "Dispatch a custom browser event from the current element",
    pattern:
`<div x-on:notify="...">
  <button x-on:click="$dispatch('notify')">...</button>
</div>`
  },
  {
    title: "$watch",
    description: "Watch a piece of data and run the provided callback anytime it changes",
    pattern:
`<div x-init="$watch('count', value => {
  console.log('count is ' + value)
})">...</div>`
  },
  {
    title: "$refs",
    description: "Reference an element by key (specified using x-ref)",
    pattern:
`<div x-init="$refs.button.remove()">
<button x-ref="button">Remove Me</button>
</div>`
  },
  {
    title: "$nextTick",
    description: "Wait until the next \"tick\" (browser paint) to run a bit of code",
    pattern:
`<div
x-text="count"
x-text="$nextTick(() => {"
  console.log('count is ' + $el.textContent)
})
>...</div>`
  },
]

export const propertiesPrompt = getPromptFromFeatures(properties)

export const methods: FeatureAPI[] = [
  {
    title: "Alpine.data",
    description: "Reuse a data object and reference it using x-data",
    pattern:
`<div x-data="dropdown">
...
</div>`
  },
  {
    title: "Alpine.store",
    description: "Declare a piece of global, reactive, data that can be accessed from anywhere using $store",
    pattern:
`<button @click="$store.notifications.notify('...')">
Notify
</button>

...

Alpine.store('notifications', {
items: [],

notify(message) { 
  this.items.push(message)
}
})`
  },
]

export const methodsPrompt = getPromptFromFeatures(methods)

export const alpine = "# Alpine.js docs\n"+ attributesPrompt // + propertiesPrompt + methodsPrompt