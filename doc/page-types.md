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

Przykładowy plik `title.json`

```
{
    "pl": "Aktualności",
    "en": "News"
}
```

Przykładowy plik `index.json`

```
[
    {
        "name": "2020-03-01.html"
    },
    {
        "name": "2020-02-28.html"
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
