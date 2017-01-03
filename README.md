# geonews  
Augmented information system which processes subtitle files (based in a custom format used by Radio Televión Española - RTVE),
extracts the geographic information (using third-party Natural Processing Language Systems like [Adega](https://citius.usc.es/transferencia/oferta-tecnoloxica/listado/adega-todos-teus-documentos-enriquecidos-anotacion),
or [Stanford NLP](http://nlp.stanford.edu/)), searchs for coordinates (using third-party GIS like [Geonames](http://www.geonames.org/) or 
[Nominatim](http://wiki.openstreetmap.org/wiki/Nominatim)) and fits into the minimal bounding box which includes a "representative area",
for instance "North Africa" or "Spain" or "Catalunya", using a own system based on PostGIS.
