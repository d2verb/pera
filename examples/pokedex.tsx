/** @jsxImportSource https://esm.sh/preact@10.27.2 */
// deno-lint-ignore-file no-import-prefix
// @ts-nocheck The old cached version of the library causes type errors sometimes.
import { useState } from "https://esm.sh/preact@10.27.2/hooks";
import { serve } from "https://esm.sh/jsr/@d2verb/pera?deps=preact@10.27.2";

type PokemonType = {
  name: string;
  url: string;
};

type PokemonStat = {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
};

type PokemonAbility = {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
};

type Pokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: {
    front_default: string;
    back_default: string;
    front_shiny: string;
    back_shiny: string;
  };
  types: Array<{
    slot: number;
    type: PokemonType;
  }>;
  stats: PokemonStat[];
  abilities: PokemonAbility[];
};

type SearchState = {
  loading: boolean;
  error: string | null;
  pokemon: Pokemon | null;
};

export function App() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchState, setSearchState] = useState<SearchState>({
    loading: false,
    error: null,
    pokemon: null,
  });

  const searchPokemon = async (name: string) => {
    if (!name.trim()) {
      setSearchState({ loading: false, error: null, pokemon: null });
      return;
    }

    setSearchState({ loading: true, error: null, pokemon: null });

    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            `Pokémon "${name}" not found. Please check the spelling.`,
          );
        }
        throw new Error(`Failed to fetch Pokémon data: ${response.status}`);
      }

      const data: Pokemon = await response.json();
      setSearchState({ loading: false, error: null, pokemon: data });
    } catch (error) {
      setSearchState({
        loading: false,
        error: error instanceof Error
          ? error.message
          : "An unexpected error occurred",
        pokemon: null,
      });
    }
  };

  const handleSearch = () => {
    searchPokemon(searchTerm);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const target = e.target as HTMLInputElement;
      searchPokemon(target.value);
    }
  };

  const formatStatName = (statName: string): string => {
    return statName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatTypeName = (typeName: string): string => {
    return typeName.charAt(0).toUpperCase() + typeName.slice(1);
  };

  const getTypeColor = (typeName: string): string => {
    const colors: Record<string, string> = {
      normal: "bg-gray-400",
      fire: "bg-red-500",
      water: "bg-blue-500",
      electric: "bg-yellow-400",
      grass: "bg-green-500",
      ice: "bg-blue-200",
      fighting: "bg-red-700",
      poison: "bg-purple-500",
      ground: "bg-yellow-600",
      flying: "bg-indigo-400",
      psychic: "bg-pink-500",
      bug: "bg-green-400",
      rock: "bg-yellow-800",
      ghost: "bg-purple-700",
      dragon: "bg-indigo-700",
      dark: "bg-gray-800",
      steel: "bg-gray-500",
      fairy: "bg-pink-300",
    };
    return colors[typeName] || "bg-gray-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
            Pokédex
          </h1>
          <p className="text-white/90 text-lg">
            Search for any Pokémon and discover their stats, abilities, and
            more!
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm((e.target as HTMLInputElement).value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter Pokémon name or ID (e.g., pikachu, 25)"
              className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searchState.loading}
              className="px-8 py-3 bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {searchState.loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {searchState.error && (
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="text-red-400 text-2xl">⚠️</div>
              <p className="text-red-100 font-medium">{searchState.error}</p>
            </div>
          </div>
        )}

        {searchState.pokemon && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            {/* Pokemon Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img
                  src={searchState.pokemon.sprites.front_default}
                  alt={searchState.pokemon.name}
                  className="w-32 h-32 object-contain bg-white/20 rounded-full p-4 shadow-lg"
                />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 capitalize">
                {searchState.pokemon.name}{" "}
                #{searchState.pokemon.id.toString().padStart(3, "0")}
              </h2>

              {/* Types */}
              <div className="flex justify-center gap-2 mb-4">
                {searchState.pokemon.types.map((type) => (
                  <span
                    key={type.slot}
                    className={`px-4 py-2 rounded-full text-white font-semibold text-sm ${
                      getTypeColor(type.type.name)
                    }`}
                  >
                    {formatTypeName(type.type.name)}
                  </span>
                ))}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-white/80 text-sm">Height</p>
                  <p className="text-white font-bold">
                    {(searchState.pokemon.height / 10).toFixed(1)}m
                  </p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-white/80 text-sm">Weight</p>
                  <p className="text-white font-bold">
                    {(searchState.pokemon.weight / 10).toFixed(1)}kg
                  </p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-white/80 text-sm">Base EXP</p>
                  <p className="text-white font-bold">
                    {searchState.pokemon.base_experience}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Base Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {searchState.pokemon.stats.map((stat) => (
                  <div
                    key={stat.stat.name}
                    className="bg-white/20 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/80 text-sm font-medium">
                        {formatStatName(stat.stat.name)}
                      </span>
                      <span className="text-white font-bold">
                        {stat.base_stat}
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            Math.min((stat.base_stat / 255) * 100, 100)
                          }%`,
                        }}
                      >
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Abilities */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Abilities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchState.pokemon.abilities.map((ability) => (
                  <div
                    key={ability.slot}
                    className="bg-white/20 rounded-lg p-4 flex items-center justify-between"
                  >
                    <span className="text-white font-medium capitalize">
                      {ability.ability.name.replace("-", " ")}
                    </span>
                    {ability.is_hidden && (
                      <span className="bg-yellow-500/30 text-yellow-200 px-2 py-1 rounded-full text-xs font-semibold">
                        Hidden
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Sprites */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-white mb-4">Sprites</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {searchState.pokemon.sprites.front_default && (
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <img
                      src={searchState.pokemon.sprites.front_default}
                      alt={`${searchState.pokemon.name} front`}
                      className="w-16 h-16 mx-auto mb-2"
                    />
                    <p className="text-white/80 text-sm">Front</p>
                  </div>
                )}
                {searchState.pokemon.sprites.back_default && (
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <img
                      src={searchState.pokemon.sprites.back_default}
                      alt={`${searchState.pokemon.name} back`}
                      className="w-16 h-16 mx-auto mb-2"
                    />
                    <p className="text-white/80 text-sm">Back</p>
                  </div>
                )}
                {searchState.pokemon.sprites.front_shiny && (
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <img
                      src={searchState.pokemon.sprites.front_shiny}
                      alt={`${searchState.pokemon.name} shiny front`}
                      className="w-16 h-16 mx-auto mb-2"
                    />
                    <p className="text-white/80 text-sm">Shiny Front</p>
                  </div>
                )}
                {searchState.pokemon.sprites.back_shiny && (
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <img
                      src={searchState.pokemon.sprites.back_shiny}
                      alt={`${searchState.pokemon.name} shiny back`}
                      className="w-16 h-16 mx-auto mb-2"
                    />
                    <p className="text-white/80 text-sm">Shiny Back</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-white/70 text-sm">
          <p>Built with pera, TailwindCSS, and PokéAPI</p>
          <p className="mt-1">
            Data provided by{" "}
            <a
              href="https://pokeapi.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-white/80 underline"
            >
              PokéAPI
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

await serve(App, {
  port: 8080,
  title: "Pokédex - pera Sample",
  moduleUrl: import.meta.url,
  props: {},
});
