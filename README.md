# Strona webowa Stowarzyszenia Otwarta Sieć Rzeczy

Websajt zbudowany z wykorzystaniem Bootstrapa oraz Svelte.

Podstawowe cechy:

* statyczny websajt - pliki mogą być serwowane przez dowolny serwer www
* możliwość dostarczania treści websajtu przy pomocy headless CMS
* oddzelenie treści od logiki websajtu oraz layoutu.
* konfigurowalne menu
* konfigurowalne sekcje strony głównej
* podstrony z listą artykułów
* podstrony z pojedynczym artykułem
* lokalizacja - wybór wersji językowej i wyświetlanie treści na podstawie wybranej wersji językowej
* możliwość publikowania wersji testowej na tym samym serwerze www, niezależnie od wersji produkcyjnej
* treści tworzone w HTML lub w Markdown

Dodatkowe informacje są opisane w plikach w folderze `doc` projektu.

## Get started

Install the dependencies...

```bash
cd osr-website
npm install
```

...then start [Rollup](https://rollupjs.org):

```bash
npm run dev
```

Navigate to [localhost:5000](http://localhost:5000). You should see your app running. Edit a component file in `src`, save it, and reload the page to see your changes.

By default, the server will only respond to requests from localhost. To allow connections from other computers, edit the `sirv` commands in package.json to include the option `--host 0.0.0.0`.


# Informacje na temat wykorzystywanego szablonu aplikacji Svelte

This is a project template for [Svelte](https://svelte.dev) apps. It lives at https://github.com/sveltejs/template.

To create a new project based on this template using [degit](https://github.com/Rich-Harris/degit):

```bash
npx degit sveltejs/template svelte-app
cd svelte-app
```

*Note that you will need to have [Node.js](https://nodejs.org) installed.*

