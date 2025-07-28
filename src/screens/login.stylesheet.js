import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  logo: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#2cd4c8",
    textAlign: "center",
    marginBottom: 20,
  },
  welcome: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#2cd4c8",
    padding: 10,
    marginBottom: 15,
    borderRadius: 10,
    color: "#000",
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 15,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#2cd4c8",
    padding: 10,
    borderRadius: 10,
    color: "#000",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 12,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  orText: {
    marginHorizontal: 10,
    color: "#999",
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#2cd4c8",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  buttonText: {
    color: "#004d40",
    fontWeight: "bold",
    marginRight: 10,
  },
  switchText: {
    color: "#aaa",
    marginTop: 15,
  },
  link: {
    color: "#2cd4c8",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default styles;
