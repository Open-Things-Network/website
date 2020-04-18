# HOW TO

* Jak skonfigurować menu?
* Jak dodać artykuł do strony Aktualności?
* Jak dodać nową podstronę z pojedynczym tekstem?
* Jak dodać nową podstronę z listą artykułów
* Jak zmienić layout lub sposób działania websajtu?

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
        "name": "2020-03-20.html"
    },
    {
        "name": "2020-02-28.html"
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
4. W folderze `blog` tworzymy pliki `title.json`, `index.json` i dodajemy `icon.png` (analogicznie do plików w podfolderze `news`).

Podstrona będzie dostępna pod adresem `blog.html`

## Jak zmienić layout lub sposób działania websajtu?

> Uwaga! Zmiana layoutu lub spospbu działania wymaga przekompilowania kodu JavaScript!

Kod źródłowy websajtu znajduje się w plikach *.svelte
Przed opublikowaniem nowej wersji na docelowy serwer konieczne jest skompilowanie jej poleceniem

```
$ npm run build
```