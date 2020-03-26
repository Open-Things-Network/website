# HOW TO

## Budowa websajtu

Rozdzielenie treści od stylów i mechaniki stron.

* Menu
* Typy stron
* Strona główna, sekcje 
* Aktualności, artykuły
* Podstrona
* Stopka

Wersje językowe

### Konfigurowanie menu

Menu definiujemy w pliku `navigation.json`. Przykład:

```
[
    {
        "url": "/",
        "label": 
                {
                    "pl": "Start",
                    "en": "Home"
                },
        "target": ""
    },
    {
        "url": "news.html",
        "label": 
                {
                    "pl": "Aktualności",
                    "en": "News"
                },
        "target": ""
    },
    {
        "url": "/forum",
        "label": 
                {
                    "pl": "Forum",
                    "en": "Forum"
                },
        "target": "_blank"
    },
    {
        "url": "files/Legal.pdf",
        "label": {
            "pl": "Warunki użytkowania",
            "en": "Usage terms"
        },
        "target": "_blank"
    }
    {
        "url": "contact.html",
        "label": {
            "pl": "Kontakt",
            "en": "Contact"
        },
        "target": ""
    }
]
```

### Typy stron

Domyślny motyw websajtu wykorzystuje 3 typy stron:

* Strona Główna: składająca się z menu nawigacyjnego, głownej ilustracji, listy sekcji oraz stopki
* Podstrona z listą artykułow: składakąca się z menu nawigacyjnego, głownej ilustracji, listy artykułów oraz stopki
* Podstrona z treścią: składakąca się z menu nawigacyjnego, pojedynczego artykułu z treścią oraz stopki

### Sekcje strony głównej

Treści oraz ikony poszczególnych sekcji znajdują się w folderze `sections`.

### Strona Aktualności

Indeks artykułów, ikona strony oraz treści poszczegółnych artykułów znajdują się w folderze `news`.

Przykładowy plik `index.json`

```
{
    "title": {"pl":"Aktualności", "en":"News"},
    "index":
            [
                {
                    "title": "20 marca 2020",
                    "published": "2020-03-20",
                    "anchor": "2020-03-20",
                    "file": "2020-03-20.html"
                }
            ]
}
```

### Strona Kontakt

Strona Kontakt wykorzystuje komponent `Subpage.svelte`.

### Strona TTN

Strona TTN wykorzystuje komponent `Subpage.svelte` - ten sam co strona Kontakt.

### Strona Signomix

Strona Signomix wykorzystuje komponent `Subpage.svelte` - ten sam co strona Kontakt.

## Jak tworzyć pliki z treścią stron i artykułów?

DO OPISANIA

## Jak dodać nową podstronę z pojedynczym tekstem?

Jeśli chcemy np. dodać podstronę `myProject`

1. Kopiujemy zawartość pliku `contact.html` do pliku o wybranej nazwie `myProject.html`
2. W folderze `subpages` tworzymy plik `myProject.html` z tekstem i dodajemy ikonę `myProject.png`
3. Do pliku `subpages/index.json` dodajemy definicję podstrony `myProject`.

Podstrona będzie dostępna pod adresem `myProject.html`

## Jak dodać nową podstronę z listą artykułów

Jeśli chcemy np. dodać podstronę `blog`

1. Kopiujemy zawartość pliku `news.html` do pliku o nazwie `blog.html`
2. Tworzymy folder `blog`
3. Tworzymy folder `blog_images`
4. W folderze `blog` tworzymy plik `index.json` i dodajemy `icon.png`

Podstrona będzie dostępna pod adresem `blog.html`