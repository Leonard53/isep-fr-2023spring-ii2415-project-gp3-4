# isep-fr-2023spring-ii2415-project-gp3-4

## Initial Installation

- Requirement: yarn
- Installation (macOS): `brew install node yarn`
- Command (Must run before proceeding!):

``` bash
    # To install node server dependencies
    yarn
```

</br>

## Bootstrap Docs

This project utilizes the Bootstrap framework for website building\
[Documentation Here](https://getbootstrap.com/docs/5.3/getting-started/vite/)

</br>

## Database

Located under `src/frAllMonumentsDataset.csv`\
Provided by the government of France

</br>

### Note that because of GitHub restrictions, git-lfs is no longer in use as lfs bandwidth usage has exceeded monthly allowance

</br>

_Download the database in JSON format on the [French Government Website](https://www.data.gouv.fr/fr/datasets/r/0dca8af6-fb5e-42d8-970f-2b369fe7e421), then put the JSON file under `src/frAllMonumentsDataset.json` (as shown in the git repo structure)_.

You can also fetch the JSON with `yarn fetchJSON` **(RECOMMENDED)**

It is possible to not fetch the JSON file in adnvace. when running either `yarn start`, `yarn build` or `yarn test`, the script will automatically call `yarn fetchJSON` if the dataset isn't present under `src/`.

</br>

## Local Preview

Execute the following command in terminal\
`npm start`\
The website will be compiled with Vite and launched on `http://127.0.0.1:8080/` or `http://localhost:8080`

</br>

## Note due to ES6 and CommonJS importing exporting style conflict

When running either `yarn build` or `yarn test`, `yarn compile` will be automatically called. This command will compile all (except `main.js`) JavaScript files under `src/js`, which are all using ES6 importing exporting style, into CommonJS importing exporting style with TypeScript support under `lib/src/js`. This is because the testing suite used in thie repo is `vitest`, which only accepts import from CommonJS modules.

**It is therefore important** to note that you should run `yarn compile` if you changed anything inside `src/js/datasetProcessing.js` or `src/js/queryProcessing.js`, as the testing files under `test/mainTest.spec.ts` import modules from `lib/src/js`. If the newly written JavaScript files are not compiled, the linter might not work properly as some modules or types might not be exported correctly.

</br>

## Testing Suite

This project use `vitest` for testing. Run `yarn test` to run the test.

Test files is located under `test/`

</br>

## NOTE: BEFORE PUSHING

Execute the following command to lint and format the code to keep some consistency\
`yarn lint`
