const https = require('node:https');

const AppSettingsModel = require('../../cardad-db/settingsSchema');

const { CarMakeModel, CarModelModel } = require('../../cardad-db/cardadSchema');

var appSettings = null;

function UpdateMakesThenModelsAsync() {
  return AppSettingsModel.findOne({ name: "NHTSA Api" }).exec().then((appsettings) => {
    appSettings = appsettings;
  }).then(updateMakeAsync).then(updateModelsAsync)
}

function updateMakeAsync() {

  return new Promise((res, rej) => {
    https.get(appSettings.apiSettings.baseUrl + '/vehicles/GetMakesForVehicleType/car?format=json', (response) => {
      console.log('statusCode:', response.statusCode);
      console.log('headers:', response.headers);
      if (response.statusCode !== 200) { rej(res.message); return; }
      var body = '';
      response.on('data', (d) => {
        body += d;
      });
      response.on('end', function () {
        var makesResponse = JSON.parse(body);
        CarMakeModel.find({ makeId: { $in: makesResponse.Results.map(m => m.MakeId) } }).exec().then((data) => {
          return data;
        })
          .then((existingRecords) => {
            var allRecords = [];
            // process results
            if (Array.isArray(existingRecords)) {
              allRecords = existingRecords;
              var newRecords = makesResponse.Results.filter(make => !existingRecords.map(m => m.makeId).includes(make.MakeId))
                .map((filtered) => { return { makeId: filtered.MakeId, makeName: filtered.MakeName, vehicleTypeId: filtered.VehicleTypeId, vehicleTypeName: filtered.VehicleTypeName } });

              CarMakeModel.insertMany(newRecords).then(records => {
                console.log(records.length.toString() + ' records inserted');
                allRecords = allRecords.concat(records);
              });
              // update records
              var updatedRecords = existingRecords.reduce((acc, ex) => {
                var match = makesResponse.Results.find(f => f.MakeId == ex.makeId);
                if (ex.makeName !== match.MakeName || ex.vehicleTypeId !== match.VehicleTypeId || ex.vehicleTypeName !== match.VehicleTypeName) {
                  ex.makeName = match.MakeName;
                  ex.vehicleTypeId = match.VehicleTypeId;
                  ex.vehicleTypeName = match.VehicleTypeName;
                  acc.push(ex);
                }
                return acc;
              }, []);
              if (!!updatedRecords) {
                console.log(updatedRecords.length.toString() + 'records updated');
                CarMakeModel.findByIdAndUpdate(existingRecords)
                  .then(updateRes => {
                    console.log(updateRes);
                    // allRecords = allRecords.concat(updateRes);
                  });
              }

            }
            else { rej('Data is not an array'); }
            res(existingRecords);
          });
      });// response ended
    }); // end of get
  }) // end of promise for getting makes
    .catch(e => console.error(e));
}   // end of this func

async function updateModelsAsync(modelArray) {

  for (const make of modelArray) {
    await new Promise((resolve, reject) => {
      https.get(appSettings.apiSettings.baseUrl + `/vehicles/GetModelsForMake/${make.makeName}?format=json`, (res) => {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);
        if (res.statusCode !== 200) { reject(res.message); return; }
        var body = '';
        res.on('data', (d) => {
          body += d;
        });
        res.on('end', function () {
          var modelResponse = JSON.parse(body);
          var results = modelResponse.Results;
          if (Array.isArray(results)) {
            CarModelModel.find({ makeId: make.makeId }).exec()
              .then((models) => {
                results.forEach((newm) => {
                  var existing = models.find((m) => newm.Model_ID == m.modelId);
                  if (existing !== undefined) existing.modelName = newm.Model_Name;
                  else {
                    models.push(new CarModelModel({ makeId: newm.Make_ID, modelId: newm.Model_ID, modelName: newm.Model_Name }));
                  }
                });
                CarModelModel.bulkSave(models)
                  .then((savedModels) => {
                    var modelIds = models.map(m => m.id);
                    console.log('Inserted ' + modelIds.length.toString() + ' models into ' + make.makeName);
                    make.models = make.models.concat(modelIds);
                    make.save().then((s) => resolve(s));
                  });
              });
          }
          else {
            reject('Data is not an array');
          }
        });
      });
    }).catch(e => console.error(e)).finally(() => {
      return new Promise((res, rej) => {
        var waitTime = (200 * Math.ceil((Math.random() * 90) + 10));
        setTimeout((time) => res(time), waitTime, waitTime);
      })
    }).then((waitTime) => console.log('Waited for ' + (waitTime / 1000).toString() + ' seconds'));
  };
}

module.exports = UpdateMakesThenModelsAsync;