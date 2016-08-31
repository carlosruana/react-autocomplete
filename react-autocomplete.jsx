import React, { PropTypes } from "react";
import { FormControl } from "react-bootstrap";

class AutocompleteField extends React.Component {
	static propTypes = {
		inputText: PropTypes.string, // default text for the input field
		items: PropTypes.array.isRequired, // all items of the dropdown before filtering with the input string values
		onClick: PropTypes.func.isRequired, // triggered when a item on the dropdown is selected
		onChange: PropTypes.func, // triggered every time the input field is changed
		name: PropTypes.string // name for the input field
	};
	constructor(props) {
		super(props);

		this.highlightedElement = null; // DOM element of the current highlighted element in the dropdown
		this.state = {
			selectedValue: this.props.inputText || "", // internal value of the input field,
			filteredItems: this._filterItems(this.props.inputText), // list of items filtered by input value
			highlightedValue: -1, // highlighted value in the dropdown
			dropdownVisible: false // visibility of the dropdown
		};
	}
	/*
	 * Manages the click event on the dropdown
	 */
	_onClick = (name, id) => {
		const filteredItems = this._filterItems(name);

		// selects new value to display in the input field
		this.setState({
			selectedValue: name,
			filteredItems
		});

		// calls props onClick callback
		this.props.onClick(name, id);
	}
	/*
	 * Manages the input field change event
	 */
	_onChange = (event) => {
		const name = event.target.value,
			filteredItems = this._filterItems(name),
			itemInList = this.props.items.find((item) => {return item.name.toLowerCase() === name.toLowerCase()});

		// if the input value text is the same as any item of the dropdown, select it
		if (itemInList) {
			this._onClick(name, itemInList.id);
		} else {
			// selects new value to display in the input field and resets highlighted item in the dropdown
			this.setState({
				selectedValue: name,
				highlightedValue: -1,
				filteredItems
			});
		}

		// calls props onChange callback
		this.props.onChange(event);
	}
	/*
	 * Returns a new list of items filtering by the value of the input field
	 */
	_filterItems = (filterString) => {
		if (!filterString.length) return this.props.items;

		return this.props.items.filter(item => {
			return item.name.toLowerCase().includes(filterString.toLowerCase()) &&
				item.name.toLowerCase() !== filterString.toLowerCase();
		});
	}
	/*
	 * Control keyboard key down events on the input field to navigate through the dropdown
	 */
	_onKeyDown = (event) => {
		if (event.keyCode === 40 && this.state.highlightedValue < this.state.filteredItems.length-1) {
			// on arrow down highlight item below
			this.setState({
				highlightedValue: this.state.highlightedValue+1
			});
		} else if (event.keyCode === 38 && this.state.highlightedValue > 0) {
			// on arrow up highlight item above
			this.setState({
				highlightedValue: this.state.highlightedValue-1
			});
		} else if (event.keyCode === 13 && this.state.highlightedValue > -1) {
			// on enter pressed if item highlighted then click to select it
			const itemInList = this.props.items.find((item) => {return item.name.toLowerCase() === name.toLowerCase()}),
				id = itemInList ? itemInList.id : null;

			this._onClick(this.highlightedElement.textContent, id);
		}
		return false;
	}
	/*
	 * Toggle dropdown visibility on focus/blur the input field
	 */
	_toggleDropdown = () => {
		this.setState({
			dropdownVisible: !this.state.dropdownVisible
		});
	}
	render() {
		// set the visibility of the dropdown
		const filteredItems = this.state.filteredItems,
			styles = this.state.dropdownVisible && filteredItems.length && this.state.selectedValue.length > 1 ? {display: "inline-block"} : {display: "none"};

		return (
			<div className="autocomplete-field">
				<FormControl name={this.props.name} ref="inputField" value={this.state.selectedValue} componentClass="input" onFocus={this._toggleDropdown} onBlur={this._toggleDropdown} onKeyDown={this._onKeyDown} onChange={this._onChange} autoComplete={"off"} />
				<div className="autocomplete-list" style={styles}>
					{
						filteredItems.map((item, index) => {
							const selectedClass = index === this.state.highlightedValue ? "autocomplete-item-selected" : "";

							return <div ref={(c) => {if(index === this.state.highlightedValue) this.highlightedElement = c}} className={"autocomplete-item " + selectedClass} onMouseDown={this._onClick.bind(this, item.name, item.id)} key={item.id}>{item.name}</div>;
						})
					}
				</div>
			</div>
		);
	}
}

export default AutocompleteField;
