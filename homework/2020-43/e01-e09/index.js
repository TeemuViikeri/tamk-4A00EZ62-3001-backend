const connectionP = require("./database/crudrepositoryPromise.js");

const main = () => {
  connectionP
    .connect()
    .then((connection) =>
      console.log(`Connected to host ${connection.config.host}.`)
    )
    .catch((err) => console.log(err));

  connectionP
    .save({ latitude: 50, longitude: 50 })
    .then((result) =>
      console.log(
        `Inserting location was successful [insertId: ${result.insertId}].`
      )
    )
    .catch((err) => console.log(err));

  connectionP
    .findAll()
    .then((result) => console.log(result))
    .catch((err) => console.log(err));

  const deleteId = 3;

  connectionP
    .deleteById(deleteId)
    .then((result) => {
      if (result.affectedRows > 0) {
        console.log(
          `Deleting location was successful [affectedRows: ${result.affectedRows}].`
        );
      } else {
        console.log(
          `Deleting location was unsuccessful [affectedRows: ${result.affectedRows}].`
        );
      }
    })
    .catch((err) => console.log(err));

  const findId = 2;

  connectionP
    .findById(findId)
    .then((result) => console.log(result))
    .catch((err) => console.log(err));

  connectionP
    .close()
    .then((connection) =>
      console.log(`Disconnected from host ${connection.config.host}.`)
    )
    .catch((err) => console.log(err));
};

main();
