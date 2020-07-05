# HOW TO

* Wybór składni dla treści strony
* Jak skonfigurować menu?
* Jak dodać artykuł do strony Aktualności?
* Jak dodać nową podstronę z pojedynczym tekstem?
* Jak dodać nową podstronę z listą artykułów?
* Jak włączyć obsługę wersji językowych?
* Jak działa zapamiętywanie wybranej wersji językowej?
* Jak zmienić layout lub sposób działania websajtu?
* Tworzenie treści w języku Markdown
* Jak opublikować nową wersję lub nowe artykuły?

## Wybór skłqdni dla treści strony

Treść publikowanych artykułów i podstron może być tworzona przy użyciu składni HTML
lub Markdown.

DO OPISANIA

## Jak skonfigurować menu?

Menu definiujemy w pliku `navigation.json`. Przykład:

```
{
    "title":"Otwarta Sieć Rzeczy",
    "logo": "resources/new_logo_horizontal_v3.svg",
    "elements": [
        {
            "url": "/",
            "label": {
                "pl": "Start",
                "en": "Home"
            },
            "target": ""
        },
        {
            "url": "news.html",
            "label": {
                "pl": "Aktualności",
                "en": "News"
            },
            "target": ""
        },
        {
            "url": "/forum",
            "label": {
                "pl": "Forum",
                "en": "Forum"
            },
            "target": "_blank"
        },
        {
            "url": "files/OSR_deklaracja_członkowska.pdf",
            "label": {
                "pl": "Deklaracja",
                "en": "Declaration"
            },
            "target": "_blank"
        },
        {
            "url": "files/Regulamin_Stowarzyszenia_Otwarta_Siec_Rzeczy.pdf",
            "label": {
                "pl": "Regulamin",
                "en": "Rules"
            },
            "target": "_blank"
        },
        {
            "url": "contact.html",
            "label": {
                "pl": "Kontakt",
                "en": "Contact"
            },
            "target": ""
        }
    ]
}
```

## Jak dodać artykuł do strony Aktualności?

1. Tworzymy plik `NAME.html` z treścią artykułu w folderze `news`. `NAME` musi być unikalne w ramach folderu.
2. Dodajemy nazwę pliku do pliku indeksu `index.json`.

Ad 1) Przykładowy plik `2020-03-20.html`. 

```
<article>
    <header>
        <title>20 marca 2020</title>
        <time>2020-03-20</time>
    </header>
<p>
    Treść artykułu ...
</p>
<p>
    kolejny akapit ...
</p>
</article>
```

Ad 2) Nazwa pliku dodana do `index.json`:

```
[
    {
        "name": "2020-03-20.html", "isComment":false
    },
    {
        "name": "2020-02-28.html", "isComment":true
    }
]
```

## Jak dodać nową podstronę z pojedynczym tekstem?

Jeśli chcemy np. dodać podstronę `myProject`

1. Kopiujemy zawartość pliku `contact.html` do pliku o wybranej nazwie `myProject.html`
2. W folderze `subpages` tworzymy plik `myProject.html` z tekstem (na wzór `subpages/contact.html`) i dodajemy ikonę `myProject.png`

Podstrona będzie dostępna pod adresem `myProject.html`

## Jak dodać nową podstronę z listą artykułów

Jeśli chcemy np. dodać podstronę `blog`

1. Kopiujemy zawartość pliku `news.html` do pliku o nazwie `blog.html`
2. Tworzymy folder `blog`
3. Tworzymy folder `blog_images`
4. W folderze `blog` tworzymy pliki `config.json`, `index.json` i dodajemy `icon.png` (analogicznie do plików w podfolderze `news`).

Podstrona będzie dostępna pod adresem `blog.html`

## Jak włączyć obsługę wersji językowych?

Włączenie wersji językowych wymaga skonfigurowania ich w pliku `main.js`.

* Angielskie sekcje strony głównej muszą być w folderze `en_sections`
* Angielskie artykuły muszą być w folderze `en_news`
* Angielskie podstrony muszą być w folderze `en_subpages`
* Jeśli dodaliśmy kolejną podstronę z listą artykułów np. w folderze `blog`, to jej angielskie artykuły muszą być w folderze z prefiksem `en_` np. `en_blog`.

## Jak działa zapamiętywanie wybranej wersji językowej?

Jeśli obsługa wersji językowych jest włączona, to:

* kiedy wybierzemy język poprzez kliknięcie flagi w menu, symbol wybranego języka jest zapisywany w `localStorage` przeglądarki,
* przy kolejnych odwiedzinach websajtu wybrany język będzie ustawiany automatycznie.

## Jak zmienić layout lub sposób działania websajtu?

> Uwaga! Zmiana layoutu lub spospbu działania wymaga przekompilowania kodu JavaScript!

Kod źródłowy websajtu znajduje się w `main.js` oraz plikach `*.svelte`. 
Przed opublikowaniem nowej wersji websajtu na docelowy serwer konieczne jest skompilowanie źródeł poleceniem:

```
$ npm run build
```

## Tworzenie treści w języku Markdown

Dla treści artykułów w sekcji `news`, sekcji strony głównej oraz podstron można wybrać stosowany rodzaj składni: HTML lub Markdown.

Przełączenie pomiędzy składnią HTML, a Markdown jest możliwe na 2 sposoby:

**Sposób 1.**<br>
Globalnie poprzez ustawienie wartości `html` lub `md` zmiennej `syntax` w pliku main.js

```
import App from './App.svelte';
let app = new App({
    target: document.body,
    props: {
        devModePort: '5000',
        defaultLanguage: 'pl',
        languages:['pl','en'],
        language: 'pl',
        syntax: 'html',
        cmsMode: false
    }
});
export default app;
```

Konwersja ze składni Markdown do HTML jest wykonywana w przeglądarce przy użyciu biblioteki [Showdown](https://github.com/showdownjs/showdown). 

**Sposób 2.**<br>
Dla wybranego typu strony

Poprzez ustawienie rozszerzenia `.html` lub `.md` dla deklarowanego `pageType`. Jak w poniższym przykładzie fragmentu
striny `test.html`.

Dla szystkich stron, które nie będą miały zadeklarowaneo rozszerzenia dla `pageType` zostanie wybrana obsługa składni zgodna z wybranym w `main.js`.

```
<!--<script>window.localStorage.setItem("pageType","single")</script>-->

<script>window.localStorage.setItem("pageType","single.md")</script>

```

## Jak opublikować nową wersję lub nowe artykuły?

Pliki składające się na websajt otwartasiecrzeczy.org są publikowane na serwer przy pomocy ftp.

Dla ułatwienia został przygotowany skrypt `build.xml` dla programu [Apache Ant](https://ant.apache.org/).

Publikowanie wersji do testowania:

```
$ ant deploy-test
```

Po uruchomieniu skryptu należy podać login, a następnie hasło użytkownika mającego konto ftp na docelowym serwerze.

Wersja testowa będzie dostępna pod adresem https://otwartasiecrzeczy.org/test`

Publikowanie wersji produkcyjnej:

```
$ ant deploy
```