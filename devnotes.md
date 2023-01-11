
## Project Initialization

```
# environment
npm install -D typescript @babel/preset-env @babel/preset-react @babel/preset-typescript babel-loader babel-plugin-import babel-plugin-lodash

# build tool related
npm install -D webpack webpack-bundle-analyzer webpack-cli webpack-dev-server webpack-merge html-webpack-plugin tsconfig-paths-webpack-plugin ts-loader style-loader json-loader css-loader copy-webpack-plugin
npm install -D @pmmmwh/react-refresh-webpack-plugin react-refresh

# UI framework
npm install react react-dom react-router-dom

# UI Kit
npm install @mantine/core @mantine/hooks @mantine/form @mantine/notifications @mantine/modals @emotion/react

# types
npm install -D @types/lodash @types/react @types/react-dom
```

## test figure

<!-- Yes -->
<figure>
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/BNF_Fr_4274_8v_knight_detail.jpg/220px-BNF_Fr_4274_8v_knight_detail.jpg">
  <figcaption>Fig.1 - Trulli, Puglia, Italy.</figcaption>
</figure>

<!-- No -->
<figure>
  [](https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/BNF_Fr_4274_8v_knight_detail.jpg/220px-BNF_Fr_4274_8v_knight_detail.jpg)
  <figcaption>Fig.1 - Trulli, Puglia, Italy.</figcaption>
</figure>
