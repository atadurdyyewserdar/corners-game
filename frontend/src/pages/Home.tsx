import GameBoard from "../components/GameBoard";

const Home = () => (
  <div className="text-center">
    <h1 className="text-2xl font-bold mb-4">Corners Game</h1>
    <p className="text-gray-600">Welcome to the Corners Game!</p>
    <GameBoard />
  </div>
);

export default Home;