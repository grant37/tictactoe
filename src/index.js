import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

/* functional component board square */
const Square = props => {

	/* functional component doesn't need render() */
	/* also notice lack of the 'this' keyword */
	return (
		<button 
			className={props.highlight ? "square highlight" : "square"} 
			onClick={props.onClick}
		>
			{props.value}	
		</button>
	);
}

/* class component board */
class Board extends React.Component {

	renderSquare(i) {
		let highlight;
		if (this.props.winner) {
			const { s1, s2, s3 } = this.props.winner;
		
			if (i === s1 || i === s2 || i === s3) {
				highlight = "win";
			}
		}
		return (
			<Square
				highlight={highlight ? highlight : null}
				value={this.props.squares[i]}
				onClick={() => this.props.onClick(i)}
				key={i}
			/>
		);
	}

	render() {
		let [ boardContent, squareId ] = [ [], 0 ];
		for (let i = 0; i < 3; i++) {
			let row = [];
			for (let j = 0; j < 3; j++) {
				row.push(this.renderSquare(squareId));
				squareId++;
			}
			boardContent.push(<div key={i} className="board-row">{row}</div>);
		}
		return (
			<div>
				{boardContent}
			</div>
		);
	}
}

/* class component game */
class Game extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			history: [{
				pos: {},
				squares: Array(9).fill(null),
				moveNum: 0,
			}],
			xIsNext: true,
			stepNumber: 0,
			ascending: true,
		};
	}

	handleClick(i) {
		/* throw away an incorrect future history */
		const history = this.state.history.slice(0, this.state.stepNumber+1);
		const current = history[history.length - 1];
		const squares = current.squares.slice();
		let pos = {};					              /* (r,c) of the move */
		pos.row = (i / 3) >> 0;                       /* this is convenient */
		pos.col = i - (pos.row * 3);                  /* this formula is generally valid */

		if (calculateWinner(squares) || squares[i]) {
			return; /* no move to be made */
		}

		squares[i] = this.state.xIsNext ? 'X' : 'O';
		this.setState({
			history: history.concat([{ /* concat won't mutate orig. array */
				pos: pos,
				squares: squares,
				moveNum: history.length,
			}]),
			xIsNext: !this.state.xIsNext,
			stepNumber: history.length,
		});
	}

	jumpTo(step) {
		this.setState({
			stepNumber: step,
			xIsNext: (step % 2 === 0),
		});

	}

	render() {
		const history = this.state.ascending ? 
			this.state.history.slice() : 
			this.state.history.slice().reverse();
		const current = this.state.history[this.state.stepNumber];
		const winner = calculateWinner(current.squares);
		const draw = isDraw(current.squares);

		/* step is the object{array}, move is the number */
		const moves = history.map((step, move) => {
			const desc = step.moveNum ?
				'Go to move #' + step.moveNum :
				'Go to game start';

			const onMove = this.state.stepNumber === step.moveNum;
			return (
				<li key={step.moveNum} value={step.moveNum}>
					<button 
						onClick={() => this.jumpTo(step.moveNum)}
						className={ onMove ? "btn current" : "btn" }
					>
					{desc} 
					{ step.moveNum ?
						(' at (' + step.pos.row +',' + step.pos.col + ')') :
						null
					}
					</button>
				</li>
			);
		});

		let status;
		if (winner) {
			status = 'Winner: ' + winner.winner;
		} 
		else if (draw) {
			status = "Game ends in a draw!";
		} else {
			status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
		}

		return (
			<div className="game">
				<div className="game-board">
					<Board 
						squares={current.squares}
						onClick={(i) => this.handleClick(i)}
						winner={winner}
					/>
				</div>
				<div className="game-info">
					<div>{status}</div>
					<button
						className="btn"
						onClick={() => 
							this.setState({ascending: !this.state.ascending})
						}
					>
					{this.state.ascending ? 
						'moves descending' : 
						'moves ascending'
					}
					</button>
					<ol>{moves}</ol>
				</div>
			</div>

		);
	}
}

/* function to calculate the game's winner */
function calculateWinner(squares) {
	const lines = [
	    [0, 1, 2],
	    [3, 4, 5],
	    [6, 7, 8],
	    [0, 3, 6],
	    [1, 4, 7],
	    [2, 5, 8],
	    [0, 4, 8],
	    [2, 4, 6],
	];

	for (let i = 0; i < lines.length; i++) {
		const [ a, b, c ] = lines[i];
		if (squares[a] && 
			squares[a] === squares[b] && 
			squares[a] === squares[c]) {
			return {winner: squares[a], s1: a, s2: b, s3: c};
		} 
	}

	return null;
}

function isDraw(squares) {
	let notFull = false;
	for (let i = 0; i < squares.length; i++) {
		notFull = notFull || !squares[i]; /* true if squares[i] == null */
	}
	return !notFull
}

ReactDOM.render(
	<Game />,
	document.getElementById('root')
);



