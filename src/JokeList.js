import React, { Component } from "react";
import axios from "axios";
import "./JokeList.css";
import Joke from "./Joke";
import uuid from "uuid/v4";

class JokeList extends Component {
    static defaultProps = {
        numJokesToGet: 10
    };
    constructor(props) {
        super(props);
        this.state = {
            // get this from local storage otherwise parse this that is just a empty array
            jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
            loading: false
        };
        //on va créer un set qui va check les doublons
        this.seenJokes = new Set(this.state.jokes.map(j => j.text));
        console.log(this.seenJokes);
        this.handleClick = this.handleClick.bind(this);
    }
    componentDidMount() {
        if (this.state.jokes.length === 0) {
            this.getJokes();
        }
    }
    async getJokes() {
        try {
            const url = "https://icanhazdadjoke.com/";
            let jokes = [];
            while (jokes.length < this.props.numJokesToGet) {
                let response = await axios.get(url, {
                    headers: { Accept: "application/json" }
                });
                let newJoke = response.data.joke;
                //check if the joke is already present.
                if (!this.seenJokes.has(newJoke)) {
                    //if not, push it
                    jokes.push({ text: newJoke, votes: 0, id: uuid() });
                } else {
                    console.log("found a duplicate !");
                    console.log(newJoke);
                }
            }
            console.log(jokes);
            //store the jokes
            this.setState(
                st => ({
                    loading: false,
                    jokes: [...st.jokes, ...jokes]
                }),
                () =>
                    window.localStorage.setItem(
                        "jokes",
                        JSON.stringify(this.state.jokes)
                    )
            );
        } catch(e){
            alert(e);
            this.setState({loading: false})
        }
    }
    handleVote(id, delta) {
        //id is a vote //delta can be positive number or negative
        // Update jokes and set it to the old state .jokes.map and map over to create a new object
        // and for each joke we gonna check is that joke id === id the that was passed in
        // if it is, we are returning the existing joke but set the votes to be j.votes + delta else return j
        this.setState(
            st => ({
                jokes: st.jokes.map(j =>
                    j.id === id ? { ...j, votes: j.votes + delta } : j
                )
            }),
            () =>
                window.localStorage.setItem(
                    "jokes",
                    JSON.stringify(this.state.jokes)
                )
        );
    }
    handleClick() {
        this.setState({ loading: true }, this.getJokes); // run getJoke func after loading is set to true
    }
    render() {
        if (this.state.loading === true) {
            return (
                <div className="JokeList-spinner">
                    <ion-icon name="cog"></ion-icon>
                    <h1 className="JokeList-title">Loading...</h1>
                </div>
            );
        }
        let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes);
        return (
            <div className="JokeList">
                <div className="JokeList-sidebar">
                    <h1 className="JokeList-title">
                        <span>Dad</span> Jokes
                    </h1>
                    <img
                        src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"
                        alt=""
                    />
                    <button
                        className="JokeList-getmore"
                        onClick={this.handleClick}
                    >
                        Fetch Jokes
                    </button>
                </div>

                <div className="JokeList-jokes">
                    {jokes.map(j => (
                        <Joke
                            text={j.text}
                            votes={j.votes}
                            key={j.id}
                            upvote={() => this.handleVote(j.id, 1)}
                            downvote={() => this.handleVote(j.id, -1)}
                        />
                    ))}
                </div>
            </div>
        );
    }
}

export default JokeList;
