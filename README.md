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

[Documentation Here](https://getbootstrap.com/docs/5.3/getting-started/vite/)

## Database

Located under `src/frAllMonumentsDataset.csv`\
Provided by the government of France

## Local Preview

Execute the following command in terminal\
`npm start`\
The website will be compiled with Vite and launched on `http://127.0.0.1:8080/`

## NOTE: BEFORE PUSHING

Execute the following command to lint and format the code to keep some consistency\
`yarn lint`
