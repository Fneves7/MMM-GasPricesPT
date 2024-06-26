Module.register("MMM-GasPricesPT", {

  defaults:
  {
    updateInterval: 600000,
    showFuelBrand: true,
    showGasStationName: true,
    showPrice: true,
    showFuelType: true,
    showDistrict: true,
    showCounty: true,
    showUpdatedAt: true,
    district: "Porto",
    county: 
    {
        "1": "Porto",
        "2": "Vila Nova de Gaia"
    },
    brand: null,
    fuelTypes:
    {
        "1": "Diesel",
        "2": "Diesel Aditivado"

    },
    gasStationType: null,
    rowLimit: 20
  },

   getStyles: function () {
    return ["MMM-combustivel.css"];
  },

  getScripts: function() {
    return [
        'gasLib.js',
        'helpers.js'
        ];
  },

  start: function () {

    this.loaded = false;
    this.results = {};
    this.url = `https://precoscombustiveis.dgeg.gov.pt/api/PrecoComb/PesquisarPostos?idsTiposComb=${Object.values(getEnumValue(FuelTypes, this.config.fuelTypes)).join(",")}&idMarca=${getEnumValue(FuelBrands, this.config.brand)}&idTipoPosto=${getEnumValue(GasStationType, this.config.gasStationType)}&idDistrito=${getEnumValue(District, this.config.district)}&idsMunicipios=${Object.values(getEnumValue(County, this.config.county)).join(",")}&qtdPorPagina=${this.config.rowLimit}&pagina=1`;
    this.getData();
    
    setInterval(() => {
      this.getData();
    }, this.config.updateInterval);
  },

  getData: async function () {
    try {
      const response = await fetch(this.url);
      const data = await response.json();

      if (data.status) {
        this.results = data.resultado;
        this.loaded = true;
        this.updateDom();

      } else {
        Log.error(`Erro ao obter dados_da_API: ${data}`);
      }
    } catch (error) {
      Log.error(`Erro ao obter dados_da_API: ${error}`);
    }
  },

  getHeader: function () {
    return "Preços de combustíveis:";
  },

  getDom: function () {
    var wrapper = document.createElement("table");
    wrapper.className = "small gas-table";

    if (!this.loaded) {
      wrapper.innerHTML = "Preços dos combustíveis em manutenção.";
      wrapper.className = "dimmed light";
      return wrapper;
    }

    var headerRow = document.createElement("tr");
    
    if (this.config.showFuelBrand) {
        var brandNameHeader = document.createElement("th");
        brandNameHeader.innerHTML = "Marca";
        headerRow.appendChild(brandNameHeader);
    }

    if (this.config.showGasStationName) {
        var stationNameHeader = document.createElement("th");
        stationNameHeader.innerHTML = "Posto de combustível";
        headerRow.appendChild(stationNameHeader);
    }

    if (this.config.showPrice) {
        var priceHeader = document.createElement("th");
        priceHeader.innerHTML = "Preço/L";
        headerRow.appendChild(priceHeader);
    }

    if (this.config.showFuelType) {
        var fuelTypeHeader = document.createElement("th");
        fuelTypeHeader.innerHTML = "Combustível";
        headerRow.appendChild(fuelTypeHeader);
    }

    if (this.config.showDistrict) {
        var districtHeader = document.createElement("th");
        districtHeader.innerHTML = "Distrito";
        headerRow.appendChild(districtHeader);
    }

    if (this.config.showCounty) {
        var countyHeader = document.createElement("th");
        countyHeader.innerHTML = "Município";
        headerRow.appendChild(countyHeader);
    }

    if (this.config.showUpdatedAt){
      var lastUpdateHeader = document.createElement("th");
      lastUpdateHeader.innerHTML = "Atualizado em:";
      headerRow.appendChild(lastUpdateHeader);
    }
    wrapper.appendChild(headerRow);

    // Data Rows
    for (var gasStation in this.results){

      var stationData = this.results[gasStation];
      var row = document.createElement("tr");

      //Gas Station Brand
      if (this.config.showFuelBrand) {
        var stationBrand = document.createElement("td");
        stationBrand.innerHTML = stationData.Marca;
        stationBrand.style.color = brandColorizer(stationData.Marca);
        row.appendChild(stationBrand);
      }

      //Gas Station Name
      if (this.config.showGasStationName){
        var stationName = document.createElement("td");
        stationName.innerHTML = stationData.Nome;
        row.appendChild(stationName);
      }

      //Gas Station Price
      if (this.config.showPrice) {
        var stationPrice = document.createElement("td");
        stationPrice.innerHTML = stationData.Preco;
        row.appendChild(stationPrice);
      }

      //Fuel Type
      if (this.config.showFuelType) {
        var fuelType = document.createElement("td");
        fuelType.innerHTML = stationData.Combustivel;
        fuelType.style.color = fuelColorizer(stationData.Combustivel);
        row.appendChild(fuelType);
      }

      //District
      if (this.config.showDistrict) {
        var district = document.createElement("td");
        district.innerHTML = stationData.Distrito;
        row.appendChild(district);
      }

      //County
      if (this.config.showCounty){
        var county = document.createElement("td");
        county.innerHTML = stationData.Municipio;
        row.appendChild(county);
      }

      //Last time
      if (this.config.showUpdatedAt){
        var lastUpdated = document.createElement("td");
        lastUpdated.innerHTML = stationData.DataAtualizacao;
        row.appendChild(lastUpdated);
      }

      wrapper.appendChild(row);
    }
    return wrapper;
  }
});