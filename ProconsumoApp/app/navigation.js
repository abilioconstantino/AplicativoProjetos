import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import App from "./app";
import NewProject from "./newProject"; // Certifique-se de importar o componente da tela "Novo Projeto"

const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={App} // Tela principal
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NewProject"
          component={NewProject} // Tela "Novo Projeto"
          options={{ title: "Novo Projeto" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}