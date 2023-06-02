# isep-fr-2023spring-ii2415-project-gp3-4

## Initial Installation

- Requirement: Yarn, git-lfs (Git Large File System)
- Installaion (MacOS): `brew install node yarn git-lfs`
- Command (Must run before proceeding!):

``` bash
    # To install node server dependencies
    yarn

    # To fetch the dataset from lfs
    git lfs fetch
```

## Bootstrap Docs
This project utilize the Bootstrap framework for website building\
[Documentation Here](https://getbootstrap.com/docs/5.3/getting-started/vite/)

## Database

Located under `src/frAllMonumentsDataset.csv`\
Provided by the government of France\

### Note that because of GitHub restrictions, git-lfs might reject pulling request if bandwidth exceed monthly allowance

_In the case of `git lfs fetch` rejection, download the database in JSON format on the [French Government Website](https://www.data.gouv.fr/fr/datasets/r/0dca8af6-fb5e-42d8-970f-2b369fe7e421), then put the JSON file under `src/frAllMonumentsDataset.json` (as shown in the git repo structure)_**.

## Local Preview

Execute the following command in terminal\
`npm start`\
The website will be compiled with Vite and launched on `http://127.0.0.1:8080/`

## NOTE: BEFORE PUSHING

Execute the following command to lint and format the code to keep some consistency\
`yarn lint`
