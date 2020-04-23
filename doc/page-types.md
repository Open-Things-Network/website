# Typy stron

* Strona główna i sekcje 
* Aktualności, artykuły
* Podstrona

Domyślny motyw websajtu wykorzystuje 3 typy stron:

* Strona Główna: składająca się z menu nawigacyjnego, głownej ilustracji, listy sekcji oraz stopki
* Podstrona z listą artykułow: składakąca się z menu nawigacyjnego, głownej ilustracji, listy artykułów oraz stopki
* Podstrona z treścią: składakąca się z menu nawigacyjnego, pojedynczego artykułu z treścią oraz stopki

Typ strony jest deklarowany w jej pliku html. Poniżej fragment głównej strony websajtu (`index.html`) 
z zadeklarowanym typem strony `home`.

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <!-- kod pominięty dla uproszczenia -->
    </head>
    <body>
        <script>window.localStorage.setItem("pageType", "home")</script>
    <!-- kod pominięty dla uproszczenia -->
    </body>
</html>
```

## Sekcje strony głównej

Treści oraz ikony poszczególnych sekcji znajdują się w folderze `sections`.

## Strona Aktualności

Konfiguracja tytyłu strony, indeks artykułów, ikona strony oraz treści poszczegółnych artykułów znajdują się w folderze `news`.

Przykładowy plik `config.json`

```
{
    "title": {
        "pl": "Aktualności",
        "en": "News"
    },
    "email":"comments@otwartasiecrzeczy.org",
    "siteUrl": "https://otwartasiecrzeczy.org",
    "disclaimer": {
        "pl": "Wysyłając komentarz akceptujesz warunki korzystania ze strony: https://otwartasiecrzeczy.org/legal.html",
        "en": "Wysyłając komentarz akceptujesz warunki korzystania ze strony: https://otwartasiecrzeczy.org/legal.html"
    },
    "prompt": {
        "pl": "Naciśnij Ctrl + C żeby skopiować odnośnik do schowka",
        "en": "Naciśnij Ctrl + C żeby skopiować odnośnik do schowka"
    },
    "link": {
        "pl": "Link do artykułu",
        "en": "Permalink"
    },
    "comments": {
        "pl": "Komentarze",
        "en": "Comments"
    },
    "send": {
        "pl": "Wyślij komentarz",
        "en": "Send comment"
    }
}
```

Przykładowy plik `index.json`

```
[
    {
        "name": "2020-03-01.html", "isComment":false
    },
    {
        "name": "2020-02-28.html", "isComment":true
    }
]
```

## Podstrony w treścią

### Strona Kontakt

Strona Kontakt wykorzystuje komponent `Subpage.svelte`.

### Strona TTN

Strona TTN wykorzystuje komponent `Subpage.svelte` - ten sam co strona Kontakt.

### Strona Signomix

Strona Signomix wykorzystuje komponent `Subpage.svelte` - ten sam co strona Kontakt.
