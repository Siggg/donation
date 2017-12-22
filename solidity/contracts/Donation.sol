pragma solidity ^0.4.2;

contract Donation {
	address superAdmin;

	function Donation() {
		superAdmin = msg.sender;
	}
	function transferAdminRights(address _newAdmin) {
		superAdmin = _newAdmin;
	}	

}