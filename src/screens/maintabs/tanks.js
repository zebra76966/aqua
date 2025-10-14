import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TanksScreen from "./tanksHome";
import UpdateTankScreen from "./forms/updateTankScreen";
import AddTank from "./forms/addTank";
import TankDetailsScreen from "./tankDetail";
import TankScanScreenTabs from "./forms/tankScanSreen";
import DiseaseScanScreen from "./forms/diseaseScanScreen";

const TanksStack = createNativeStackNavigator();

function TanksStackNavigator() {
  return (
    <TanksStack.Navigator screenOptions={{ headerShown: false }}>
      <TanksStack.Screen name="TanksHome" component={TanksScreen} />
      <TanksStack.Screen name="UpdateTank" component={UpdateTankScreen} />
      <TanksStack.Screen name="AddTank" component={AddTank} />
      <TanksStack.Screen name="TankDetail" component={TankDetailsScreen} />
      <TanksStack.Screen name="TankScanScreenTabs" component={TankScanScreenTabs} />
      <TanksStack.Screen name="DiseaseScanScreen" component={DiseaseScanScreen} />
    </TanksStack.Navigator>
  );
}

export default TanksStackNavigator;
