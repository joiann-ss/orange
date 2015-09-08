(function () {
    "use strict";

    angular
        .module('orange')
        .factory('medications', medications);

    medications.$inject = ['$rootScope', '$q', 'n2w', 'notifications', 'Patient'];

    /* @ngInject */
    function medications($rootScope, $q, n2w, notify, Patient) {
        var vm = this;
        var service = {
            setMedicationSchedule: setMedicationSchedule,
            setMedicationEvents: setMedicationEvents,
            saveMedication: saveMedication,
            setNotifications: setNotifications,
            getMedication: getMedication,
            setMedication: setMedication,
            get: get,
            fetch: fetch,
            getAll: getAll,
            fetchAll: fetchAll,
            getMedications: getMedications,
            remove: remove,
            setLog: setLog,
            getEventText: getEventText,

            createMedication: createMedication
        };


        vm.medications = null;
        vm.medication = null;
        vm.log = null;

        $rootScope.$on('auth:user:logout', clean);


        return service;

        ////////////////

        function clean() {
            console.log('User logged out, cleaning medications service data...');
            vm.medications = null;
            vm.medication = null;
            vm.log = null;
        }

        function saveMedication(medication) {
            medication = medication || vm.medication;
            if (medication.id) {
                return medication.save().then(
                    function(medication) {
                        vm.medication = medication;
                        notify.updateNotify();
                        return medication;
                    },
                    function(error) {
                        return error;
                    }
                )
            } else {
                return vm.log.all('medications').post(medication).then(
                    function (medication) {
                        vm.medication = medication;
                        if (!(medication.import_id && _.find(vm.medications, {import_id: medication.import_id}))) {
                            vm.medications.push(medication);
                        }
                        notify.addNotifyByMedication(medication);
                        return medication;
                    },
                    function (error) {
                        return error;
                    }
                )
            }
        }

        function setNotifications(notifications) {
            var promises = [];
            for (var i = 0, len = vm.medication.schedule.times.length; i < len; i++) {
                var time = vm.medication.schedule.times[i];
                var notification = notifications[i] || 30;
                console.log('setting notification time', vm.medication.id, time.id, notification);
                var promise = vm.medication.all('times').one(time.id.toString()).customPUT({
                   user: notification
                });
                promises.push(promise);
            }
            return $q.all(promises);
        }

        function setMedication(medication) {
            vm.medication = medication;
        }

        function setMedicationSchedule(schedule) {
            vm.medication.schedule = schedule;
        }

        function setMedicationEvents(events) {
            vm.medication.schedule.times = events;
        }

        function getMedication() {
            return vm.medication;
        }

        function get(id) {
            id = parseInt(id);
            var deffered = $q.defer();
            var promise = deffered.promise;
            if (vm.medication && !id) {
                deffered.resolve(vm.medication);
            } else if (vm.medication && vm.medication.id === id) {
                deffered.resolve(vm.medication);
            } else if (vm.medications !== null) {
                vm.medication = _.find(vm.medications, {'id': id});
                deffered.resolve(vm.medication);
            } else {
                promise = fetch(id);
            }

            return promise;
        }

        function fetch(id) {
            var deffered = $q.defer();
            vm.log.all('medications').get(id).then(
                function (medication) {
                    vm.medication = medication;
                    deffered.resolve(medication);
                },
                function (error) {
                    deffered.reject(error);
                }
            );
            return deffered.promise;
        }

        function getMedications() {
            return vm.medications;
        }

        function setLog(log) {
            if (vm.log && log.id !== vm.log.id) {
                vm.medications = null;
                vm.medication = null;
            }
            vm.log = log;
        }

        function getAll() {
            var deffered = $q.defer();
            if (vm.medications !== null) {
                deffered.resolve(vm.medications);
                return deffered.promise;
            } else {
                return fetchAll();
            }
        }

        function remove(medication) {
            var deffered = $q.defer();

            medication.remove().then(
                function () {
                    if (vm.medications !== null) {
                        vm.medications = _.without(vm.medications, medication);
                    }
                    vm.medication = null;
                    deffered.resolve();

                    notify.updateNotify();
                },
                function (error) {
                    deffered.reject(error);
                }
            );
            return deffered.promise;
        }

        function fetchAll() {
            var deffered = $q.defer();

            if (vm.log) {
                vm.log.all('medications').getList().then(
                    function (medications) {
                        vm.medications = medications;
                        vm.medication = null;
                        deffered.resolve(medications);
                    },
                    function (error) {
                        deffered.reject(error);
                    }
                );
                return deffered.promise;
            } else {
                return Patient.getPatient().then(function (patient) {
                    return patient.all('medications').getList().then(function (items) {
                        vm.medications = items;
                        return items;
                    });
                });
            }

        }

        function getEventText(event) {
            var result = '';
            var units = vm.medication.dose.quantity;
            result += _.capitalize(n2w.toWords(units || 0));
            result += ' unit' + (units === 1 ? '' : 's');
            if (event.type == 'exact') {
                result += ' at ' + event.time;
            } else {
                if (event.when === 'after' && event.event === 'sleep') {
                    result += ' ' + 'after wake';
                } else {
                    result += ' ' + event.when + ' ' + event.event;
                }

            }
            return result;
        }

        function createMedication(medication) {
            return vm.log.all('medications').post(medication).then(
                function (medication) {
                    vm.medications.push(medication);
                    return medication;
                });
        }
    }
})();